import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		include: ['test/**/*.e2e-spec.ts'],
		exclude: ['node_modules', 'dist', 'src/**/*'],
		globals: true,
		environment: 'node',
		setupFiles: ['test/e2e-setup.ts'],
		testTimeout: 30_000,
		hookTimeout: 30_000,
		pool: 'forks',
	},
});
