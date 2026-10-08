import type { Theme } from '@satellatickets/tokens';
import type { TextStyle, ViewStyle } from 'react-native';

export interface FieldState {
  focused: boolean;
  invalid: boolean;
  disabled: boolean;
  readOnly: boolean;
}

/**
 * La caja de los controles de texto (`Input`, `TextArea`, `Select`): borde, fondo y
 * estados. Es el equivalente nativo de `field.module.css`.
 *
 * El borde en reposo es `border.strong`: el contorno de un campo tiene que
 * distinguirse del fondo con un contraste de 3:1.
 */
export function fieldContainerStyle(
  t: Theme,
  { focused, invalid, disabled, readOnly }: FieldState,
): ViewStyle {
  const accent = invalid ? t.color.feedback.danger.icon : t.color.border.focus;
  const style: ViewStyle = {
    borderWidth: t.borderWidth.thin,
    borderRadius: t.radius.md,
    borderColor: disabled ? 'transparent' : invalid || focused ? accent : t.color.border.strong,
    backgroundColor: disabled
      ? t.color.action.disabled
      : readOnly
        ? t.color.bg.subtle
        : t.color.bg.surface,
  };
  // El foco engrosa el contorno sin mover el contenido, como el `outline` en web.
  if (focused && !disabled) {
    style.outlineStyle = 'solid';
    style.outlineColor = accent;
    style.outlineWidth = t.borderWidth.thin;
  }
  return style;
}

/** Tipografía del texto que se escribe o se muestra dentro de la caja. */
export function fieldTextStyle(t: Theme, disabled: boolean): TextStyle {
  const style: TextStyle = {
    fontSize: t.font.size.md,
    fontWeight: t.font.weight.regular,
    color: disabled ? t.color.text.disabled : t.color.text.primary,
  };
  const family = t.font.family.sans;
  if (family !== undefined) style.fontFamily = family;
  return style;
}
