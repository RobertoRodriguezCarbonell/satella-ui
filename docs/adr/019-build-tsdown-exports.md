# ADR-019: Build con tsdown, doble salida y conditional exports

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

Una librería no se compila como una app: genera módulos que otro bundler (Next.js en web, Metro en nativo) consumirá. Debe mantener la estructura de módulos para tree-shaking, excluir las dependencias compartidas, generar tipos y entregar a cada plataforma solo su código.

## Decisión

**Bundler: tsdown.** Sucesor de tsup (cuyo README recomienda la migración), construido sobre Rolldown, con soporte de serie para librerías React con CSS y generación de `.d.ts`.

**Doble build por paquete con vistas** (`ui`, `icons`): tsdown se ejecuta dos veces desde el mismo código, una resolviendo `.web.tsx` y otra `.native.tsx`. Salidas en `dist/web/` y `dist/native/`.

**`package.json` de `ui`:**

```jsonc
{
  "name": "@satellatickets/ui",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "react-native": "./dist/native/index.js",
      "import": "./dist/web/index.js"
    },
    "./styles.css": "./dist/web/styles.css"
  },
  "sideEffects": ["*.css"],
  "files": ["dist"],
  "peerDependencies": {
    "react": ">=19.0",
    "react-dom": ">=19.0",
    "react-native": ">=0.81"
  },
  "peerDependenciesMeta": {
    "react-dom": { "optional": true },
    "react-native": { "optional": true }
  },
  "dependencies": {
    "@satellatickets/core": "workspace:*",
    "@satellatickets/tokens": "workspace:*"
  }
}
```

- Metro reconoce la condición `react-native`; el resto de bundlers usa `import`.
- Los CSS Modules se compilan en el build web a un único `styles.css` con clases con hash.
- `react`, `react-dom` y `react-native` **nunca** se empaquetan (`neverBundle` en tsdown): son peers, opcionales por plataforma.
- `core` y `tokens` son dependencias normales de `ui` (no peers), con versiones gestionadas por Changesets.
- **publint** valida en CI que `exports`, `types` y `files` están bien formados.

## Alternativas descartadas

- **tsup.** Deprecado a favor de tsdown.
- **Rollup/Vite en modo librería a mano.** Más configuración para el mismo resultado.
- **Publicar solo ESM sin build (source distribution).** Obligaría a cada app a compilar la librería y a conocer CSS Modules y la resolución por plataforma.

## Consecuencias

- Una app web nunca recibe código nativo ni al revés.
- Tree-shaking efectivo: solo los componentes importados van al bundle final.
- `pnpm pack` produce el `.tgz` exacto que se publicaría, para probar en apps externas.
