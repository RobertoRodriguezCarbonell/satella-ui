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
  Badge,
  Box,
  Button,
  Icon,
  Stack,
  Text,
  UIProvider,
  type ThemeMode,
} from '@satellatickets/ui';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

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

const themes = ['dark', 'light'] as const satisfies readonly ThemeMode[];

/** Una pantalla pequeña, como la de cualquier app: solo componentes de la librería. */
export default function App() {
  const [loaded, error] = useFonts(fonts);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [brand, setBrand] = useState<BrandName | undefined>(undefined);
  const [buying, setBuying] = useState(false);

  if (!loaded && !error) return null;

  function buy() {
    setBuying(true);
    setTimeout(() => setBuying(false), 1500);
  }

  return (
    <UIProvider theme={theme} brand={brand}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <Box background="canvas" paddingX={4} paddingY={16} flex={1}>
        <Stack gap={6}>
          <Stack direction="row" gap={2} align="center" wrap>
            {themes.map((option) => (
              <Button
                key={option}
                size="sm"
                variant={theme === option ? 'secondary' : 'ghost'}
                onPress={() => setTheme(option)}
              >
                {option === 'dark' ? 'Oscuro' : 'Claro'}
              </Button>
            ))}
            {[undefined, ...brandNames].map((option) => (
              <Button
                key={option ?? 'satella'}
                size="sm"
                variant={brand === option ? 'secondary' : 'ghost'}
                onPress={() => setBrand(option)}
              >
                {option ?? 'satella'}
              </Button>
            ))}
          </Stack>

          <Box background="surface" padding={5} radius="lg" borderColor="default" shadow="sm">
            <Stack gap={4}>
              <Stack gap={2} align="start">
                <Badge variant="warning">Últimas entradas</Badge>
                <Text variant="title">Noche Satella</Text>
                <Stack direction="row" gap={2} align="center">
                  <Icon name="calendar" size="sm" color="secondary" />
                  <Text variant="bodySmall" color="secondary">
                    Sábado 17 de octubre, 23:30
                  </Text>
                </Stack>
                <Stack direction="row" gap={2} align="center">
                  <Icon name="map-pin" size="sm" color="secondary" />
                  <Text variant="bodySmall" color="secondary">
                    Sala Apolo, Barcelona
                  </Text>
                </Stack>
              </Stack>
              <Stack gap={3}>
                <Button iconStart="ticket" loading={buying} onPress={buy} fullWidth>
                  Comprar entradas
                </Button>
                <Button variant="secondary" iconEnd="arrow-right" fullWidth>
                  Ver detalles
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </UIProvider>
  );
}
