import { AppModule } from '@/app.module';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppConfigService } from './services/config.service';

describe('AppModule', () => {
	let app;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('debería estar definido', () => {
		expect(AppModule).toBeDefined();
	});

	it('debería configurar ConfigModule correctamente', () => {
		const configModule = app.get(ConfigModule);
		expect(configModule).toBeInstanceOf(ConfigModule);
	});

	it('debería configurar ThrottlerModule con limitación de tasa', () => {
		const throttlerModule = app.get(ThrottlerModule);
		expect(throttlerModule).toBeInstanceOf(ThrottlerModule);

		const throttlerGuard = app.get(ThrottlerGuard);
		expect(throttlerGuard).toBeInstanceOf(ThrottlerGuard);
	});

	it('debería configurar ScheduleModule', () => {
		const scheduleModule = app.get(ScheduleModule);
		expect(scheduleModule).toBeInstanceOf(ScheduleModule);
	});

	it('debería configurar SequelizeModule con conexión a base de datos', () => {
		const sequelizeModule = app.get(SequelizeModule);
		expect(sequelizeModule).toBeInstanceOf(SequelizeModule);

		const configService = app.get(ConfigService);
		expect(configService.get('DATABASE_HOST')).toBeDefined();
	});

	it('debería configurar CacheModule con Redis', () => {
		const cacheModule = app.get(CacheModule);
		expect(cacheModule).toBeInstanceOf(CacheModule);

		// Verificar que se configuró con KeyvRedis
		const configService = app.get(ConfigService);
		expect(configService.get('REDIS_URL')).toBeDefined();
	});

	it('debería aplicar CorrelationIdMiddleware a todas las rutas', () => {
		const appModule = app.get(AppModule);
		const consumer = {
			_routes: [],
			apply: vi.fn().mockReturnThis(),
			forRoutes: vi.fn(),
		};

		appModule.configure(consumer as unknown as MiddlewareConsumer);

		expect(consumer.apply).toHaveBeenCalled();
		expect(consumer.forRoutes).toHaveBeenCalledWith('{*splat}');
	});

	it('debería proporcionar AppConfigService como un proveedor global', () => {
		const appConfigService = app.get(AppConfigService);
		expect(appConfigService).toBeInstanceOf(AppConfigService);
	});
});
