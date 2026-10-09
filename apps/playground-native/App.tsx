import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import { Unbounded_400Regular, Unbounded_700Bold } from '@expo-google-fonts/unbounded';
import { brandNames, type BrandName } from '@satellatickets/tokens';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormField,
  Icon,
  IconButton,
  Input,
  Link,
  Select,
  Sheet,
  Skeleton,
  Stack,
  Switch,
  Tabs,
  Text,
  UIProvider,
  useToast,
  type ThemeMode,
} from '@satellatickets/ui';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

/**
 * Las fuentes las carga la app, no la librería (ADR-027). En Expo Go cada clave es una
 * familia; en una build nativa se registran con el plugin de expo-font en app.json.
 */
const fonts = {
  Unbounded: Unbounded_700Bold,
  Unbounded_400Regular,
  'Hanken Grotesk': HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  'IBM Plex Mono': IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
};

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  price: number;
  lastTickets: boolean;
}

const EVENTS: readonly Event[] = [
  {
    id: 'noche-satella',
    name: 'Noche Satella',
    date: 'Sábado 17 de octubre, 23:30',
    venue: 'Sala Apolo, Barcelona',
    price: 24,
    lastTickets: true,
  },
  {
    id: 'festival-litoral',
    name: 'Festival Litoral',
    date: 'Viernes 6 de noviembre, 18:00',
    venue: 'Parc del Fòrum, Barcelona',
    price: 58,
    lastTickets: false,
  },
];

const QUANTITIES = ['1', '2', '3', '4'].map((value) => ({
  value,
  label: value === '1' ? '1 entrada' : `${value} entradas`,
}));

const themes = ['dark', 'light'] as const satisfies readonly ThemeMode[];

/** El formulario de compra, dentro de un `Sheet`: los controles de formulario y su validación. */
function Checkout({ event, onClose }: { event: Event | undefined; onClose: () => void }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [accepted, setAccepted] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [paying, setPaying] = useState(false);

  // La librería no valida (ADR-037): la app decide qué es un error y se lo pasa al campo.
  const emailError = submitted && !email.includes('@') ? 'Escribe un correo válido.' : undefined;
  const total = (event?.price ?? 0) * Number(quantity);

  function pay() {
    setSubmitted(true);
    if (!email.includes('@') || !accepted) return;
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setSubmitted(false);
      onClose();
      toast.show({
        tone: 'success',
        title: 'Compra completada',
        description: `Hemos enviado las entradas a ${email}.`,
      });
    }, 1200);
  }

  return (
    <Sheet
      open={event !== undefined}
      onClose={onClose}
      title={event?.name ?? ''}
      description={event === undefined ? undefined : `${event.date} · ${event.venue}`}
      closeLabel="Cerrar"
      footer={
        <Button iconStart="ticket" loading={paying} onPress={pay} fullWidth>
          {`Pagar ${total} €`}
        </Button>
      }
    >
      <Stack gap={4}>
        <FormField
          label="Correo electrónico"
          required
          help="Te enviaremos las entradas aquí."
          error={emailError}
        >
          <Input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChangeText={setEmail}
            onSubmit={pay}
          />
        </FormField>
        <FormField label="Cantidad">
          <Select options={QUANTITIES} value={quantity} onValueChange={setQuantity} />
        </FormField>
        <Checkbox checked={accepted} invalid={submitted && !accepted} onCheckedChange={setAccepted}>
          Acepto las condiciones de compra
        </Checkbox>
        <Switch checked={newsletter} onCheckedChange={setNewsletter}>
          Avisarme de las preventas
        </Switch>
        {submitted && !accepted ? (
          <Alert tone="danger">Tienes que aceptar las condiciones para continuar.</Alert>
        ) : null}
      </Stack>
    </Sheet>
  );
}

function EventCard({ event, onBuy }: { event: Event; onBuy: () => void }) {
  return (
    <Card>
      <Stack gap={4}>
        <Stack gap={2} align="start">
          {event.lastTickets ? <Badge variant="warning">Últimas entradas</Badge> : null}
          <Text variant="subheading">{event.name}</Text>
          <Stack direction="row" gap={2} align="center">
            <Icon name="calendar" size="sm" color="secondary" />
            <Text variant="bodySmall" color="secondary">
              {event.date}
            </Text>
          </Stack>
          <Stack direction="row" gap={2} align="center">
            <Icon name="map-pin" size="sm" color="secondary" />
            <Text variant="bodySmall" color="secondary">
              {event.venue}
            </Text>
          </Stack>
        </Stack>
        <Divider />
        <Stack direction="row" gap={3} align="center" justify="between">
          <Text variant="subheading">{`${event.price} €`}</Text>
          <Button size="sm" iconStart="ticket" onPress={onBuy}>
            Comprar
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

/** El hueco de una tarjeta mientras llegan los eventos. */
function EventCardSkeleton() {
  return (
    <Card>
      <Stack gap={4}>
        <Box>
          <Skeleton variant="subheading" width="50%" />
          <Skeleton variant="bodySmall" lines={2} />
        </Box>
        <Skeleton shape="rectangle" width={120} height={36} />
      </Stack>
    </Card>
  );
}

function Screen({
  theme,
  brand,
  onTheme,
  onBrand,
}: {
  theme: ThemeMode;
  brand: BrandName | undefined;
  onTheme: (theme: ThemeMode) => void;
  onBrand: (brand: BrandName | undefined) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<Event | undefined>(undefined);

  // Una carga simulada, para ver los `Skeleton` antes que el contenido.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const events = loading ? (
    <Stack gap={4}>
      <EventCardSkeleton />
      <EventCardSkeleton />
    </Stack>
  ) : (
    <Stack gap={4}>
      {EVENTS.map((event) => (
        <EventCard key={event.id} event={event} onBuy={() => setBuying(event)} />
      ))}
    </Stack>
  );

  const tickets = (
    <Stack gap={4}>
      <Alert tone="info" title="Todavía no tienes entradas">
        Cuando compres una, la verás aquí y te llegará por correo.
      </Alert>
      <Text variant="bodySmall" color="secondary">
        {'¿Compraste sin iniciar sesión? '}
        <Link href="https://satellatickets.com/ayuda">Recupera tus entradas</Link>.
      </Text>
    </Stack>
  );

  return (
    <Box background="canvas" flex={1}>
      <ScrollView contentContainerStyle={{ paddingTop: 64, paddingBottom: 48 }}>
        <Box paddingX={4}>
          <Stack gap={5}>
            <Stack direction="row" gap={2} align="center" wrap>
              {themes.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={theme === option ? 'secondary' : 'ghost'}
                  onPress={() => onTheme(option)}
                >
                  {option === 'dark' ? 'Oscuro' : 'Claro'}
                </Button>
              ))}
              {[undefined, ...brandNames].map((option) => (
                <Button
                  key={option ?? 'satella'}
                  size="sm"
                  variant={brand === option ? 'secondary' : 'ghost'}
                  onPress={() => onBrand(option)}
                >
                  {option ?? 'satella'}
                </Button>
              ))}
            </Stack>
            <Stack direction="row" gap={3} align="center" justify="between">
              <Text variant="title">Satella</Text>
              <IconButton
                icon={theme === 'dark' ? 'eye' : 'eye-off'}
                label={theme === 'dark' ? 'Cambiar al tema claro' : 'Cambiar al tema oscuro'}
                onPress={() => onTheme(theme === 'dark' ? 'light' : 'dark')}
              />
            </Stack>
            <Tabs
              accessibilityLabel="Secciones"
              items={[
                { value: 'eventos', label: 'Eventos', icon: 'calendar', content: events },
                { value: 'entradas', label: 'Mis entradas', icon: 'ticket', content: tickets },
              ]}
            />
          </Stack>
        </Box>
      </ScrollView>
      <Checkout event={buying} onClose={() => setBuying(undefined)} />
    </Box>
  );
}

/**
 * Un flujo de compra pequeño, como el de cualquier app: solo componentes de la librería,
 * más el `ScrollView` de React Native. `UIProvider` va en la raíz: aplica el tema y la
 * marca, y pinta los toasts sobre la vista que lo contiene.
 */
export default function App() {
  const [loaded, error] = useFonts(fonts);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [brand, setBrand] = useState<BrandName | undefined>(undefined);

  if (!loaded && !error) return null;

  return (
    <UIProvider theme={theme} brand={brand}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <Screen theme={theme} brand={brand} onTheme={setTheme} onBrand={setBrand} />
    </UIProvider>
  );
}
