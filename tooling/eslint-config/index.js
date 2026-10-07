/**
 * Configuración compartida de ESLint.
 *
 * Cada paquete exporta una fábrica (`tokens`, `core`, `icons`, `ui`, `webApp`,
 * `nativeApp`) que devuelve la configuración de esa capa. Además del lint
 * habitual, cada fábrica impone sobre `src/` las reglas de dependencia de
 * ADR-002 y la convención de ficheros por plataforma de ADR-004: un import
 * prohibido falla en lint, no en revisión.
 *
 * Uso en `packages/core/eslint.config.js`:
 *
 *   import { core } from '@satellatickets/eslint-config';
 *   export default core({ tsconfigRootDir: import.meta.dirname });
 */
import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @typedef {{ tsconfigRootDir: string }} Options */

const JS = ['**/*.{js,jsx,mjs,cjs}'];
const JSX = ['**/*.{jsx,tsx}'];

// Las reglas de capa se aplican al código fuente, no a los ficheros de
// configuración del paquete (eslint.config.js, tsdown.config.ts…).
const SRC = ['src/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}'];
const WEB = ['src/**/*.web.{ts,tsx}'];
const NATIVE = ['src/**/*.native.{ts,tsx}'];
const PLATFORM = [...WEB, ...NATIVE];

const IGNORES = [
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
  '**/.turbo/**',
  '**/storybook-static/**',
];

// ---------------------------------------------------------------------------
// Fronteras entre capas (ADR-002)
// ---------------------------------------------------------------------------

/**
 * Construye la regla `no-restricted-imports` a partir de una lista de
 * restricciones. Cada módulo prohíbe también sus subrutas (`react-native/*`).
 *
 * @param {Array<{ modules: string[]; message: string; allowTypeImports?: boolean }>} entries
 */
function restricted(entries) {
  return {
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        patterns: entries.map(({ modules, message, allowTypeImports = false }) => ({
          group: modules.flatMap((name) => [name, `${name}/*`]),
          message,
          allowTypeImports,
        })),
      },
    ],
  };
}

const NO_REACT = {
  modules: ['react', 'react-dom', 'react-native'],
  message: '`tokens` no importa nada de React (ADR-002).',
};

const NO_INTERNAL_PACKAGES = {
  modules: ['@satellatickets'],
  message: 'Este paquete no puede importar otros paquetes del monorepo (ADR-002).',
};

const NO_PLATFORM_IN_CORE = {
  modules: ['react-dom', 'react-native', '@satellatickets/ui', '@satellatickets/icons'],
  message:
    '`core` solo importa `react` y `@satellatickets/tokens`; nunca react-dom ni react-native (ADR-002).',
};

const NO_RN_IN_WEB = {
  modules: ['react-native'],
  message: 'Una vista web (*.web.tsx) no importa react-native (ADR-002).',
};

const NO_DOM_IN_NATIVE = {
  modules: ['react-dom'],
  message: 'Una vista nativa (*.native.tsx) no importa react-dom (ADR-002).',
};

const NO_PLATFORM_IN_NEUTRAL = {
  modules: ['react-dom', 'react-native'],
  message:
    'Un fichero sin sufijo de plataforma (tipos, historias, index) no importa react-dom ni react-native en runtime; usa `import type` si solo necesitas tipos (ADR-002, ADR-012).',
  allowTypeImports: true,
};

/**
 * Los ficheros `.web`/`.native` solo existen en `ui` e `icons` (ADR-002).
 * El selector `Program` marca el fichero entero.
 */
const noPlatformFiles = {
  files: PLATFORM,
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Program',
        message:
          'Los ficheros .web/.native solo existen en packages/ui y packages/icons (ADR-002).',
      },
    ],
  },
};

/**
 * Nunca se importa directamente `./Button.web` o `./Button.native`: el bundler
 * resuelve la plataforma a partir de `./Button` (ADR-004).
 */
const SUFFIX = '/\\.(web|native)$/';
const noSuffixImports = {
  files: SRC,
  rules: {
    'no-restricted-syntax': [
      'error',
      ...[
        `ImportDeclaration[source.value=${SUFFIX}]`,
        `ExportAllDeclaration[source.value=${SUFFIX}]`,
        `ExportNamedDeclaration[source.value=${SUFFIX}]`,
        `ImportExpression > Literal[value=${SUFFIX}]`,
      ].map((selector) => ({
        selector,
        message:
          'Importa desde el nombre sin sufijo (`./Button`); el bundler resuelve .web/.native (ADR-004).',
      })),
    ],
  },
};

/**
 * Reglas por tipo de fichero para los paquetes con vistas (`ui`, `icons`).
 * `common` se añade a las tres clases de fichero.
 *
 * @param {Array<{ modules: string[]; message: string; allowTypeImports?: boolean }>} common
 */
function platformBoundaries(common = []) {
  return [
    { files: SRC, ignores: PLATFORM, rules: restricted([...common, NO_PLATFORM_IN_NEUTRAL]) },
    { files: WEB, rules: restricted([...common, NO_RN_IN_WEB]) },
    { files: NATIVE, rules: restricted([...common, NO_DOM_IN_NATIVE]) },
  ];
}

// ---------------------------------------------------------------------------
// Bloques reutilizables
// ---------------------------------------------------------------------------

/** JS + TypeScript con información de tipos. Sin Prettier: se añade al final. */
function foundation({ tsconfigRootDir }) {
  return [
    globalIgnores(IGNORES),
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      rules: {
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
        ],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
      },
    },
    {
      files: JS,
      extends: [tseslint.configs.disableTypeChecked],
      languageOptions: { globals: globals.node },
    },
  ];
}

/** React (sin prop-types: el contrato está tipado) y reglas de hooks. */
const reactBase = [
  {
    files: JSX,
    extends: [react.configs.flat.recommended, react.configs.flat['jsx-runtime']],
    // Versión explícita: `detect` usa context.getFilename(), eliminado en ESLint 10.
    settings: { react: { version: '19.2' } },
    rules: { 'react/prop-types': 'off' },
  },
  reactHooks.configs.flat.recommended,
];

/** Accesibilidad web (axe en Storybook la complementa, ADR-016). No aplica a vistas nativas. */
const a11yWeb = {
  files: JSX,
  ignores: NATIVE,
  extends: [jsxA11y.flatConfigs.recommended],
};

/** Globals del navegador solo en las vistas web. */
const browserGlobals = {
  files: WEB,
  languageOptions: { globals: globals.browser },
};

// ---------------------------------------------------------------------------
// Fábricas por capa
// ---------------------------------------------------------------------------

/** Raíz y tooling: sin reglas de capa. @param {Options} options */
export function base(options) {
  return defineConfig([...foundation(options), prettier]);
}

/** `@satellatickets/tokens`: nada de React ni de otros paquetes. @param {Options} options */
export function tokens(options) {
  return defineConfig([
    ...foundation(options),
    { files: SRC, rules: restricted([NO_REACT, NO_INTERNAL_PACKAGES]) },
    noPlatformFiles,
    prettier,
  ]);
}

/** `@satellatickets/core`: solo `react` y `tokens`; nunca específico de plataforma. @param {Options} options */
export function core(options) {
  return defineConfig([
    ...foundation(options),
    reactHooks.configs.flat.recommended,
    { files: SRC, rules: restricted([NO_PLATFORM_IN_CORE]) },
    noPlatformFiles,
    prettier,
  ]);
}

/** `@satellatickets/icons`: `react` y `react-native`; ningún otro paquete del monorepo. @param {Options} options */
export function icons(options) {
  return defineConfig([
    ...foundation(options),
    ...reactBase,
    a11yWeb,
    browserGlobals,
    ...platformBoundaries([NO_INTERNAL_PACKAGES]),
    noSuffixImports,
    prettier,
  ]);
}

/** `@satellatickets/ui`: puede importar todo lo anterior, con fronteras por plataforma. @param {Options} options */
export function ui(options) {
  return defineConfig([
    ...foundation(options),
    ...reactBase,
    a11yWeb,
    browserGlobals,
    ...platformBoundaries(),
    noSuffixImports,
    prettier,
  ]);
}

/** Apps web (storybook-web, playground-web). @param {Options} options */
export function webApp(options) {
  return defineConfig([
    ...foundation(options),
    ...reactBase,
    a11yWeb,
    { files: JSX, languageOptions: { globals: globals.browser } },
    prettier,
  ]);
}

/** Apps nativas (storybook-native, playground-native). @param {Options} options */
export function nativeApp(options) {
  return defineConfig([...foundation(options), ...reactBase, prettier]);
}
