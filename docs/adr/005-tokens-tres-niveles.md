# ADR-005: Tokens en tres niveles: primitivos, semánticos, de componente

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Un design token es una decisión de diseño guardada como dato con nombre. La forma de organizarlos determina lo fácil que resulta añadir temas (claro/oscuro) y marcas (un cliente con su propia identidad) sin tocar componentes.

## Decisión

Tres niveles:

| Nivel | Contenido | Ejemplo | Uso en componentes |
|---|---|---|---|
| **Primitivos** | La paleta en bruto: todos los valores disponibles | `color.blue.600`, `space.4`, `radius.md` | Nunca directamente |
| **Semánticos** | El significado de cada valor; referencian primitivos | `color.bg.surface → {color.gray.50}`, `color.action.primary → {color.blue.600}` | Siempre |
| **De componente** | Ajustes de un componente concreto; referencian semánticos | `button.primary.bg → {color.action.primary}` | Solo ese componente |

Reglas:

- Los componentes consumen **solo** tokens semánticos o de componente. Nunca primitivos ni valores literales.
- Un **tema** (claro, oscuro) redefine únicamente la capa semántica.
- Una **marca** redefine un subconjunto de semánticos (color principal, radios, tipografía). La carpeta `src/brands/` existe desde el principio aunque esté vacía.
- Los tokens de componente solo se crean cuando un componente necesita desviarse de los semánticos. Por defecto no existen.

## Alternativas descartadas

- **Dos niveles (primitivos + uso directo).** Los temas obligarían a tocar cada componente.
- **Tokens de componente obligatorios para todo.** Explosión de tokens sin beneficio; la mayoría de componentes no necesita desviarse.

## Consecuencias

- Añadir un tema o una marca es añadir un fichero de datos; ningún componente cambia.
- Exige disciplina al nombrar la capa semántica: el nombre describe el uso (`bg.surface`), no el valor (`gray.50`).
- Los tests de completitud (ADR-015) garantizan que todo tema/marca define todos los semánticos.
