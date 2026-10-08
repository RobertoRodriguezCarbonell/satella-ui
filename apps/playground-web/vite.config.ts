import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Dentro del monorepo, `@satellatickets/ui` se resuelve a su código fuente para tener
// recarga en caliente, así que Vite debe preferir las vistas `.web.tsx` (ADR-004). Una
// app que instala el paquete publicado no necesita esta configuración: recibe la
// versión web ya compilada. Esa ruta la comprueba `pnpm check:packages`.
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
});
