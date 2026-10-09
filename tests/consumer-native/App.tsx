// Una pantalla que usa un componente de cada grupo del catálogo. No se ejecuta: Metro la
// empaqueta para comprobar que el paquete publicado resuelve sus vistas nativas.
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormField,
  IconButton,
  Input,
  Link,
  Modal,
  Select,
  Sheet,
  Skeleton,
  Spinner,
  Stack,
  Switch,
  Tabs,
  Text,
  TextArea,
  UIProvider,
  useTheme,
  useToast,
} from '@satellatickets/ui';
import type { ButtonNativeProps, ButtonProps, InputNativeProps } from '@satellatickets/ui';
import { useState } from 'react';
import { View } from 'react-native';

// Los tipos del contrato y los propios de nativo se pueden usar desde una app.
const variant: ButtonProps['variant'] = 'primary';
const testID: ButtonNativeProps['testID'] = 'comprar';
const fieldStyle: InputNativeProps['style'] = { flexGrow: 1 };

function Screen() {
  const theme = useTheme();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg.canvas, paddingTop: 96 }}>
      <Box padding={6}>
        <Stack gap={4}>
          <Text variant="title">Noche Satella</Text>
          <Badge variant="warning">Últimas entradas</Badge>
          <Alert tone="info" title="Las entradas se envían por correo" />
          <Tabs
            accessibilityLabel="Mis entradas"
            items={[
              { value: 'proximas', label: 'Próximas', content: 'Tienes 2 entradas.' },
              { value: 'pasadas', label: 'Pasadas', content: 'Has ido a 14 eventos.' },
            ]}
          />
          <Card>
            <Stack gap={4}>
              <FormField label="Correo electrónico" required>
                <Input type="email" style={fieldStyle} />
              </FormField>
              <FormField label="Ciudad">
                <Select
                  placeholder="Elige una ciudad"
                  options={[
                    { value: 'mad', label: 'Madrid' },
                    { value: 'bcn', label: 'Barcelona' },
                  ]}
                />
              </FormField>
              <TextArea accessibilityLabel="Comentario" rows={2} />
              <Checkbox defaultChecked>Acepto las condiciones</Checkbox>
              <Switch>Avisarme de las preventas</Switch>
              <Divider />
              <Stack direction="row" gap={3} align="center">
                <Button
                  variant={variant}
                  iconStart="ticket"
                  testID={testID}
                  onPress={() => toast.show({ tone: 'success', title: 'Entradas enviadas' })}
                >
                  Comprar
                </Button>
                <IconButton icon="settings" label="Filtros" onPress={() => setFilters(true)} />
                <Link href="https://satellatickets.com/ayuda">Ayuda</Link>
                <Spinner label="Cargando" />
              </Stack>
              <Skeleton lines={2} />
            </Stack>
          </Card>
          <Button variant="secondary" onPress={() => setOpen(true)}>
            Condiciones
          </Button>
        </Stack>
      </Box>
      <Modal open={open} onClose={() => setOpen(false)} title="Condiciones" closeLabel="Cerrar">
        Las entradas no se pueden revender por encima de su precio.
      </Modal>
      <Sheet open={filters} onClose={() => setFilters(false)} title="Filtros" closeLabel="Cerrar" />
    </View>
  );
}

export default function App() {
  return (
    <UIProvider theme="dark">
      <Screen />
    </UIProvider>
  );
}
