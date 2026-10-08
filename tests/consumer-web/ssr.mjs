// Render en servidor con Node: el paquete se puede importar como ESM y pinta un <button>.
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

import { Button, UIProvider } from '@satellatickets/ui';

const html = renderToString(
  createElement(
    UIProvider,
    { theme: 'dark' },
    createElement(Button, { iconStart: 'ticket' }, 'Comprar entradas'),
  ),
);

if (!/<button[^>]*class="[^"]*sui-root/.test(html) || !html.includes('Comprar entradas')) {
  throw new Error(`El HTML renderizado no contiene el botón de la librería:\n${html}`);
}
console.log('Render en servidor correcto.');
