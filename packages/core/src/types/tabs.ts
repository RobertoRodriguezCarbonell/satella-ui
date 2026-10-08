import type { ReactNode } from 'react';

/** Una pestaña de `Tabs`. */
export interface TabItem<IconName extends string = string> {
  /** Lo que recibe `onValueChange`. */
  value: string;
  /** Texto de la pestaña. */
  label: string;
  /** Icono decorativo delante del texto. */
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
  /**
   * Contenido de su panel. Sin él, `Tabs` solo pinta las pestañas y la app decide qué
   * mostrar con `value`, por ejemplo para filtrar una lista.
   */
  content?: ReactNode;
}

/**
 * Contrato de `Tabs`: varias vistas del mismo nivel entre las que se cambia sin salir de
 * la página. El conjunto de iconos lo aporta `@satellatickets/icons`, que está fuera de
 * `core` (ADR-002), por eso el nombre es un parámetro de tipo.
 */
export interface TabsProps<IconName extends string = string> {
  items: readonly TabItem<IconName>[];
  /** Pestaña elegida, controlada por la app. Sin ella, guarda su propio estado (ADR-037). */
  value?: string | undefined;
  /** Pestaña inicial cuando guarda su propio estado. Por defecto, la primera habilitada. */
  defaultValue?: string | undefined;
  /** Se llama con el `value` de la pestaña elegida. */
  onValueChange?: ((value: string) => void) | undefined;
  /** Nombre accesible del grupo de pestañas ("Mis entradas"). */
  accessibilityLabel?: string | undefined;
  /** `data-testid` en web, `testID` en nativo. */
  testID?: string | undefined;
}
