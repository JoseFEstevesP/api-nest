import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Dialect } from 'sequelize';
import { EnvironmentVariables, validateEnv } from './config/env.config';
import { CorrelationIdMiddleware } from './correlation-id/correlationId.middleware';
import { FilesModule } from './modules/files/files.module';
import { HealthModule } from './modules/health/health.module';
import { AuditModule } from './modules/security/audit/audit.module';
import { AuthModule } from './modules/security/auth/auth.module';
import { RolModule } from './modules/security/rol/rol.module';
import { UserModule } from './modules/security/user/user.module';
import { AppConfigService } from './services/config.service';

@Module({
	imports: [
		ConfigModule.forRoot({
			validate: validateEnv,
			isGlobal: true,
			envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
		}),
		ThrottlerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService<EnvironmentVariables>) => [
				{
					ttl: config.get<number>('RATE_LIMIT_TTL'),
					limit: config.get<number>('RATE_LIMIT_LIMIT'),
				},
			],
		}),
		ScheduleModule.forRoot(),
		SequelizeModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService<EnvironmentVariables>) => ({
				dialect: config.get<string>('DATABASE_DIALECT') as Dialect,
				host: config.get<string>('DATABASE_HOST'),
				port: config.get<number>('DATABASE_PORT'),
				username: config.get<string>('POSTGRES_USER'),
				password: config.get<string>('POSTGRES_PASSWORD'),
				database: config.get<string>('POSTGRES_DB'),
				autoLoadModels: true,
				synchronize: false,
				logging: false,
			}),
		}),
		CacheModule.registerAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService<EnvironmentVariables>) => ({
				store: new KeyvRedis({
					url: config.get<string>('REDIS_URL'),
				}),
			}),
			isGlobal: true,
		}),
		FilesModule,
		UserModule,
		RolModule,
		AuditModule,
		AuthModule,
		HealthModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: AppConfigService,
			useClass: AppConfigService,
		},
	],
	exports: [AppConfigService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(CorrelationIdMiddleware).forRoutes('{*splat}');
	}
}
