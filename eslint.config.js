import { base } from '@satellatickets/eslint-config';

// Configuración para los ficheros de la raíz y de `tooling/`. Cada paquete de
// `packages/` y `apps/` tiene la suya: ESLint 10 usa la configuración más
// cercana a cada fichero.
export default base({ tsconfigRootDir: import.meta.dirname });
