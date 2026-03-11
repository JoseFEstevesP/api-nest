import { EnvironmentVariables } from '@/config/env.config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
	constructor(private configService: ConfigService<EnvironmentVariables>) {}

	get port(): number {
		return this.configService.get<number>('PORT', { infer: true }) ?? 3000;
	}

	get jwtConfig() {
		return {
			secret:
				this.configService.get<string>('JWT_SECRET', { infer: true }) ?? '',
			refreshSecret:
				this.configService.get<string>('JWT_REFRESH_SECRET', { infer: true }) ??
				'',
		};
	}

	get emailConfig() {
		return {
			user: this.configService.get<string>('EMAIL_USER', { infer: true }) ?? '',
			pass: this.configService.get<string>('EMAIL_PASS', { infer: true }) ?? '',
		};
	}

	get databaseConfig() {
		return {
			dialect:
				this.configService.get<string>('DATABASE_DIALECT', { infer: true }) ??
				'postgres',
			host:
				this.configService.get<string>('DATABASE_HOST', { infer: true }) ??
				'localhost',
			port:
				this.configService.get<number>('DATABASE_PORT', { infer: true }) ??
				5432,
			username:
				this.configService.get<string>('POSTGRES_USER', { infer: true }) ?? '',
			password:
				this.configService.get<string>('POSTGRES_PASSWORD', { infer: true }) ??
				'',
			database:
				this.configService.get<string>('POSTGRES_DB', { infer: true }) ?? '',
		};
	}

	get corsConfig(): string[] {
		const cors = this.configService.get('CORS');
		if (Array.isArray(cors)) {
			return cors as string[];
		}
		return [];
	}

	get rateLimitConfig() {
		return {
			ttl:
				this.configService.get<number>('RATE_LIMIT_TTL', { infer: true }) ?? 60,
			limit:
				this.configService.get<number>('RATE_LIMIT_LIMIT', { infer: true }) ??
				100,
		};
	}

	get redisConfig() {
		return {
			url: this.configService.get<string>('REDIS_URL', { infer: true }) ?? '',
		};
	}
}
