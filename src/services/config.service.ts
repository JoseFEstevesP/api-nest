import { EnvironmentVariables } from '@/config/env.config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
	constructor(private configService: ConfigService<EnvironmentVariables>) {}

	get port(): number {
		return this.configService.get('PORT');
	}

	get jwtConfig() {
		return {
			secret: this.configService.get('JWT_SECRET'),
			refreshSecret: this.configService.get('JWT_REFRESH_SECRET'),
		};
	}

	get emailConfig() {
		return {
			user: this.configService.get('EMAIL_USER'),
			pass: this.configService.get('EMAIL_PASS'),
		};
	}

	get databaseConfig() {
		return {
			dialect: this.configService.get('DATABASE_DIALECT'),
			host: this.configService.get('DATABASE_HOST'),
			port: this.configService.get('DATABASE_PORT'),
			username: this.configService.get('POSTGRES_USER'),
			password: this.configService.get('POSTGRES_PASSWORD'),
			database: this.configService.get('POSTGRES_DB'),
		};
	}

	get corsConfig(): string[] {
		return this.configService.get('CORS');
	}

	get rateLimitConfig() {
		return {
			ttl: this.configService.get('RATE_LIMIT_TTL'),
			limit: this.configService.get('RATE_LIMIT_LIMIT'),
		};
	}

	get redisConfig() {
		return {
			url: this.configService.get('REDIS_URL'),
		};
	}
}
