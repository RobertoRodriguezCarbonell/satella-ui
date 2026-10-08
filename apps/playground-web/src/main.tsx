import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import './fonts';
import './index.css';

// Una app que instala el paquete publicado importa aquí, además, sus estilos:
//   import '@satellatickets/ui/styles.css';
// En el monorepo no hace falta: Vite compila los CSS Modules del código fuente.

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
