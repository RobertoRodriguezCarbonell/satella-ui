# ADR-002: Capas `tokens → core → ui` y reglas de dependencia

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Para que la arquitectura híbrida (ADR-001) se mantenga en el tiempo hace falta separar físicamente lo compartible de lo específico de plataforma, y que esa separación la imponga la herramienta y no la disciplina.

## Decisión

Cuatro paquetes con una dirección de dependencia estricta:

```
tokens  →  core  →  ui  →  apps
                    ↑
                  icons
```

| Paquete | Contenido | Puede importar |
|---|---|---|
| `tokens` | Design tokens y sus salidas generadas | Nada de React |
| `core` | Hooks headless, tipos, constantes de variantes, utilidades | `react`, `tokens` |
| `icons` | SVG fuente y componentes generados para web y nativo | `react`, `react-native` (solo en su salida nativa) |
| `ui` | Componentes con vistas web y nativa | Todo lo anterior |

Reglas:

- `core` **nunca** importa `react-dom`, `react-native` ni ningún módulo específico de plataforma. Solo `react` y TypeScript puro.
- `ui` es el único paquete con ficheros `.web.tsx` / `.native.tsx`.
- Las reglas se imponen con ESLint (`no-restricted-imports` por paquete y reglas de fronteras en `tooling/eslint-config`). Un import prohibido falla en lint, no en revisión manual.

## Alternativas descartadas

- **Un único paquete `ui` con subcarpetas.** Más simple de arrancar, pero nada impide que la lógica compartida importe `react-native` por accidente, y no permite publicar `tokens` o `core` por separado.
- **Dividir `ui` en `ui-web` y `ui-native`.** Duplica la API pública y obliga a las apps a elegir paquete; rompe la promesa de una sola importación.

## Consecuencias

- Cambiar un token se propaga a todo de forma automática.
- `core` es compartible por construcción, no por convención.
- Añade algo de ceremonia (cuatro `package.json`, configuración de lint por paquete) que se paga una vez en la Fase 0.
