import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		include: ['src/**/*.spec.ts'],
		exclude: ['node_modules', 'dist', 'test/**/*'],
		globals: true,
		environment: 'node',
		setupFiles: ['src/test/setup.ts'],
		testTimeout: 30_000,
		hookTimeout: 30_000,
		isolate: true,
		pool: 'threads',
		poolOptions: {
			threads: {
				singleThread: true,
			},
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov', 'html'],
			exclude: [
				'node_modules',
				'test',
				'src/main.ts',
				'src/migrations/**',
				'**/*.d.ts',
				'**/*.spec.ts',
				'**/*.e2e-spec.ts',
			],
			thresholds: {
				global: {
					branches: 70,
					functions: 70,
					lines: 70,
					statements: 70,
				},
			},
		},
	},
});
