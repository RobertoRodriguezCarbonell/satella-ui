import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import {
  Unbounded_400Regular,
  Unbounded_700Bold,
  Unbounded_800ExtraBold,
} from '@expo-google-fonts/unbounded';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import StorybookUIRoot from './.rnstorybook';

/**
 * Fuentes de Satella (ADR-027). En Expo Go (SDK 56) cada clave es una familia: la clave
 * con el nombre de la familia lleva su peso principal (Android lo usa tal cual) y el
 * resto de pesos se registran con claves propias para que iOS, que empareja por los
 * metadatos del fichero, pueda elegir la cara por `fontWeight`. En una build nativa,
 * el plugin de expo-font de app.json registra cada familia con todos sus pesos.
 */
const fonts = {
  Unbounded: Unbounded_700Bold,
  Unbounded_400Regular,
  Unbounded_800ExtraBold,
  'Hanken Grotesk': HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  'IBM Plex Mono': IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
};

export default function App() {
  const [loaded, error] = useFonts(fonts);
  if (error) console.warn('No se pudieron cargar las fuentes; se usará la del sistema.', error);
  if (!loaded && !error) return null;
  return (
    <>
      <StatusBar style="auto" />
      <StorybookUIRoot />
    </>
  );
}
