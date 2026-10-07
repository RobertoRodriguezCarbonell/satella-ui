# ADR-017: Jest + React Native Testing Library para las vistas nativas

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Las vistas nativas no pueden ejecutarse en Vitest modo navegador. En React Native, Jest es el runner estándar y React Native Testing Library (RNTL) y el preset de Expo están pensados primero para Jest.

## Decisión

- **Jest** con el preset `jest-expo` para `packages/ui` en su variante nativa, ejecutado con `pnpm test:native`.
- **React Native Testing Library** para renderizar y consultar por rol y nombre accesible.
- Los tests nativos **reutilizan los `args` de las historias** para probar exactamente los mismos casos que la web:

```tsx
// Button.native.test.tsx
import { Primary, Disabled } from './Button.stories';

test('dispara onPress al pulsar', () => {
  const onPress = jest.fn();
  render(<UIProvider><Button {...Primary.args} onPress={onPress} /></UIProvider>);
  fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});
```

- Cada interacción cubierta por una función `play` en web tiene su test nativo equivalente.
- **Sin regresión visual nativa en esta fase.** Requiere simuladores en CI y herramientas específicas; su coste no compensa hasta tener un número significativo de componentes en producción. La revisión visual nativa se hace en `storybook-native`.

## Alternativas descartadas

- **Vitest para nativo.** Posible pero con mucho menos tooling; ir contracorriente del ecosistema añade fricción sin beneficio.
- **Tests nativos con historias ejecutadas en el dispositivo (Storybook test runner nativo).** Inmaduro frente a RNTL y requiere dispositivo en CI.

## Consecuencias

- Dos runners en el monorepo (Vitest y Jest), con API casi idéntica.
- Los tests nativos se ejecutan en Node sin simulador, así que son rápidos y caben en cada PR.
- La regresión visual nativa queda como hito futuro (ROADMAP).
