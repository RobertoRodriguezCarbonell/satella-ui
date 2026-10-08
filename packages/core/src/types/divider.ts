/** Orientación de `Divider` (ADR-009). */
export const dividerOrientations = ['horizontal', 'vertical'] as const;
export type DividerOrientation = (typeof dividerOrientations)[number];

/** Contrato de `Divider`: una línea fina que separa dos bloques de contenido. */
export interface DividerProps {
  /**
   * `horizontal` (por defecto) separa bloques apilados. `vertical` separa elementos de
   * una fila y ocupa su altura.
   */
  orientation?: DividerOrientation | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
}
