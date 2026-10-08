import type { ReactNode } from 'react';

/**
 * Contrato de `Switch`: un ajuste que se activa o desactiva con efecto inmediato.
 * Para una opción que se confirma al enviar un formulario, usa `Checkbox`.
 */
export interface SwitchProps {
  /** Estado controlado por la app. Sin él, guarda su propio estado (ADR-037). */
  checked?: boolean | undefined;
  /** Estado inicial cuando guarda su propio estado. */
  defaultChecked?: boolean | undefined;
  /** Se llama con el estado nuevo al pulsarlo. */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  /** No se puede pulsar ni enfocar. */
  disabled?: boolean | undefined;
  /** Nombre accesible cuando no hay etiqueta visible. */
  accessibilityLabel?: string | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
  /** Etiqueta. Pulsarla también cambia el interruptor. */
  children?: ReactNode;
}
