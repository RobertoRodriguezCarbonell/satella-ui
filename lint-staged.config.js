/**
 * Hook de pre-commit (ADR-022): lint y formato de los ficheros cambiados y
 * typecheck de los paquetes afectados. Los paquetes sin cambios son cache hits
 * de Turborepo, así que el typecheck solo cuesta en lo que se ha tocado.
 *
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.{json,md,mdx,css,yml,yaml}': ['prettier --write'],
  '*.{ts,tsx,mts,cts}': () => 'turbo run typecheck --filter=...[HEAD]',
};
