import '@satellatickets/ui/styles.css';
import { UIProvider } from '@satellatickets/ui';
import type { ReactNode } from 'react';

// Un Server Component, como cualquier layout de la App Router: sin "use client".
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <UIProvider theme="dark">{children}</UIProvider>
      </body>
    </html>
  );
}
