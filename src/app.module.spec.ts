import { MiddlewareConsumer } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AppModule } from './app.module';
import { CorrelationIdMiddleware } from './correlation-id/correlation-id.middleware';

describe('AppModule', () => {
	it('debería estar definido', () => {
		expect(AppModule).toBeDefined();
	});

	it('debería tener un método configure', () => {
		const appModule = new AppModule();
		expect(typeof appModule.configure).toBe('function');
	});

	it('debería configurar middleware CorrelationId', () => {
		const appModule = new AppModule();
		const consumer = {
			apply: vi.fn().mockReturnThis(),
			forRoutes: vi.fn(),
		};

		appModule.configure(consumer as unknown as MiddlewareConsumer);

		expect(consumer.apply).toHaveBeenCalledWith(CorrelationIdMiddleware);
		expect(consumer.forRoutes).toHaveBeenCalledWith('{*splat}');
	});

	it('debería tener imports definidos', () => {
		const imports = Reflect.getMetadata('imports', AppModule);
		expect(imports).toBeDefined();
		expect(Array.isArray(imports)).toBe(true);
		expect(imports.length).toBeGreaterThan(0);
	});

	it('debería tener providers definidos', () => {
		const providers = Reflect.getMetadata('providers', AppModule);
		expect(providers).toBeDefined();
		expect(Array.isArray(providers)).toBe(true);
		expect(providers.length).toBeGreaterThan(0);
	});

	it('debería tener exports definidos', () => {
		const exports = Reflect.getMetadata('exports', AppModule);
		expect(exports).toBeDefined();
		expect(Array.isArray(exports)).toBe(true);
	});
});
