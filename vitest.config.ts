import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    globals: true,
    environment: 'node',
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules', 'test', 'src/main.ts'],
    },
    alias: {
      '@': './src',
    },
    deps: {
      register: ['@swc/core'],
    },
    transformMode: {
      web: [/.[jt]sx$/],
    },
  },
});
