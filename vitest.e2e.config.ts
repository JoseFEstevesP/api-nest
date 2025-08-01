import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['test/**/*.e2e-spec.ts'],
    exclude: ['node_modules', 'dist'],
    globals: true,
    environment: 'node',
    setupFiles: ['test/e2e-setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    alias: {
      '@': './src',
    },
  },
});
