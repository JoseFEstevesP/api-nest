import dotenv from 'dotenv';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

dotenv.config({ path: '.env.test' });

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		include: ['test/**/*.e2e-spec.ts'],
		exclude: ['node_modules', 'dist', 'src/**/*'],
		globals: true,
		environment: 'node',
		setupFiles: ['test/e2e-setup.ts'],
		testTimeout: 120_000,
		hookTimeout: 120_000,
		pool: 'forks',
	},
});
