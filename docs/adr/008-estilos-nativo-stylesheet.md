# ADR-008: Estilos nativos con `StyleSheet` y `ThemeProvider` propio

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Las vistas nativas (`*.native.tsx`) necesitan consumir los temas generados (ADR-006) sin obligar a las apps consumidoras a instalar y configurar una herramienta de estilos adicional.

## Decisión

- `StyleSheet` de React Native para los estilos estáticos.
- Un **`ThemeProvider` propio** (dentro de `UIProvider`, ADR-010) que entrega el tema activo por contexto, y un hook `useTheme()` para los estilos que dependen de tokens.

```tsx
// Button.native.tsx
const t = useTheme();
<Pressable style={[styles.base, variantStyles[variant](t), sizeStyles[size](t)]} />
```

Reglas:

- Los estilos dependientes del tema se expresan como funciones `(t: Theme) => ViewStyle`, en mapas exhaustivos por variante (ADR-014).
- Estados (`pressed`, `disabled`) se gestionan con las APIs nativas (`Pressable` con función de estilo).

## Alternativas descartadas

- **Unistyles 3.** Técnicamente la mejor opción (cambio de tema sin re-render, variantes nativas), pero exige React Native ≥ 0.78 con Nueva Arquitectura y configuración en cada app consumidora. Queda registrada como **optimización futura**: si el rendimiento del cambio de tema importara, la migración quedaría encerrada en las vistas nativas sin tocar la API pública.
- **NativeWind.** Acopla a Tailwind y a su configuración en cada app; su versión actual no cubre web de forma estable.
- **Tamagui.** Impone su runtime y su compilador a las apps.

## Consecuencias

- Cero dependencias impuestas: una app solo necesita envolverse en `<UIProvider>`.
- Cambiar de tema re-renderiza los componentes que usan `useTheme()`. Es una acción muy poco frecuente para el usuario; el coste es aceptable.
- Funciona en cualquier versión de React Native dentro de la ventana soportada (ADR-024).
