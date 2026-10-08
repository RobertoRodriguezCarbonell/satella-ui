import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    passWithNoTests: true,
    coverage: {
      // ADR-015: `core` es lógica compartida por las dos plataformas; cobertura mínima del 90 %.
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}'],
      reporter: ['text'],
      thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 },
    },
  },
});
