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
import { useState } from 'react';

const themes = ['dark', 'light'] as const satisfies readonly ThemeMode[];

/** Una pantalla pequeña, como la de cualquier app: solo componentes de la librería. */
export function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [brand, setBrand] = useState<BrandName | undefined>(undefined);
  const [buying, setBuying] = useState(false);

  function buy() {
    setBuying(true);
    setTimeout(() => setBuying(false), 1500);
  }

  return (
    <UIProvider theme={theme} brand={brand}>
      <Box background="canvas" padding={6} style={{ minHeight: '100vh' }}>
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

          <Stack align="start">
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
                <Stack direction="row" gap={3} align="center" wrap>
                  <Button iconStart="ticket" loading={buying} onPress={buy}>
                    Comprar entradas
                  </Button>
                  <Button variant="secondary" iconEnd="arrow-right">
                    Ver detalles
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </UIProvider>
  );
}
