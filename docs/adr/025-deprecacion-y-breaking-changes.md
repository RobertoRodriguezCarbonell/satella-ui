# ADR-025: Política de deprecación y definición de breaking change

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Las apps confían en la librería si pueden actualizar sin sorpresas. En una librería de UI, "romper" es más amplio que cambiar una firma: un cambio visual puede romper el layout de una app aunque la API no cambie.

## Decisión

**Qué es un breaking change:**

- Cambiar o eliminar una prop, una variante o un valor por defecto.
- Cambiar el HTML renderizado en web (un `<button>` que pasa a `<a>` rompe selectores y tests de las apps).
- Cambiar el **tamaño o la posición** de un componente, aunque sea sutil.
- Renombrar o eliminar un token semántico.
- Subir versiones mínimas de peers (ADR-024).
- Eliminar un export público.

Un cambio visual visible que **no** altere tamaño ni posición (color, sombra, radio) es `minor`, nunca `patch`.

**Ciclo de deprecación en tres pasos**, obligatorio para cualquier eliminación:

1. **Marcar**: JSDoc `@deprecated` con la alternativa (TypeScript lo tacha en el editor) y un `console.warn` **una sola vez** por sesión, solo en desarrollo, indicando qué usar en su lugar.
2. **Convivir**: lo viejo y lo nuevo funcionan a la vez durante al menos **una versión `minor`**.
3. **Eliminar**: solo en la siguiente **`major`**, con la migración documentada en el `CHANGELOG`.

**Codemods**: cuando un breaking change afecta a muchas llamadas (renombrar una prop muy usada), la `major` incluye un script de migración automática en `packages/ui/codemods/`.

En `0.x`, los breaking changes se publican como `minor` (ADR-021), pero el ciclo de deprecación se aplica igual siempre que sea razonable.

## Alternativas descartadas

- **Breaking changes sin periodo de convivencia.** Obliga a las apps a migrar en el mismo momento en que actualizan.
- **Considerar los cambios visuales como `patch`.** Es lo habitual en librerías de lógica, pero en UI rompe apps sin que nadie lo vea en el diff.

## Consecuencias

- Las apps pueden actualizar `minor` y `patch` con confianza.
- Las `major` son poco frecuentes y vienen con guía de migración.
- Exige disciplina al escribir changesets: el tipo lo decide esta lista, no la intuición.
