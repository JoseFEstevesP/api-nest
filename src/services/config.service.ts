import { EnvironmentVariables } from '@/config/env.config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
	constructor(private configService: ConfigService<EnvironmentVariables>) {}

	get port(): number {
		return this.configService.get<number>('PORT');
	}

	get jwtConfig() {
		return {
			secret: this.configService.get<string>('JWT_SECRET'),
			refreshSecret: this.configService.get<string>('JWT_REFRESH_SECRET'),
		};
	}

	get emailConfig() {
		return {
			user: this.configService.get<string>('EMAIL_USER'),
			pass: this.configService.get<string>('EMAIL_PASS'),
		};
	}

	get databaseConfig() {
		return {
			dialect: this.configService.get<string>('DATABASE_DIALECT'),
			host: this.configService.get<string>('DATABASE_HOST'),
			port: this.configService.get<number>('DATABASE_PORT'),
			username: this.configService.get<string>('POSTGRES_USER'),
			password: this.configService.get<string>('POSTGRES_PASSWORD'),
			database: this.configService.get<string>('POSTGRES_DB'),
		};
	}

	get corsConfig(): string[] {
		return this.configService.get<string[]>('CORS');
	}

	get rateLimitConfig() {
		return {
			ttl: this.configService.get<number>('RATE_LIMIT_TTL'),
			limit: this.configService.get<number>('RATE_LIMIT_LIMIT'),
		};
	}

	get redisConfig() {
		return {
			url: this.configService.get<string>('REDIS_URL'),
		};
	}
}
