import type { ReactNode } from 'react';

import type { FeedbackTone } from './feedback';

interface AlertBaseProps {
  /** Qué comunica (por defecto `info`). Fija el color y el icono. */
  tone?: FeedbackTone | undefined;
  /** Resumen en una línea. */
  title?: string | undefined;
  /** Explicación o siguiente paso. */
  children?: ReactNode;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
}

interface AlertStaticProps extends AlertBaseProps {
  onClose?: undefined;
  closeLabel?: undefined;
}

interface AlertClosableProps extends AlertBaseProps {
  /** Si existe, el aviso muestra un botón para cerrarlo y la llama al pulsarlo. */
  onClose: () => void;
  /**
   * Nombre accesible del botón de cierre ("Cerrar aviso"). Es obligatorio con
   * `onClose`: la librería no trae textos propios.
   */
  closeLabel: string;
}

/**
 * Contrato de `Alert`: un mensaje dentro de la página que no desaparece solo. `danger`
 * y `warning` se anuncian de inmediato a los lectores de pantalla; `success` e `info`,
 * cuando terminan lo que estén leyendo.
 */
export type AlertProps = AlertStaticProps | AlertClosableProps;
