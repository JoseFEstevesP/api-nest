import { plainToClass } from 'class-transformer';
import {
	IsEmail,
	IsEnum,
	IsNumber,
	IsString,
	MinLength,
	Validate,
	validateSync,
} from 'class-validator';
import { IsCorsValidConstraint } from './isCorsValid';

export enum Environment {
	Development = 'development',
	Production = 'production',
	Test = 'test',
}

export enum DefaultRole {
	User = 'user',
}

export class EnvironmentVariables {
	@IsNumber()
	PORT: number;

	@IsString()
	@MinLength(64)
	JWT_SECRET: string;

	@IsString()
	@MinLength(64)
	JWT_REFRESH_SECRET: string;

	@IsEmail()
	EMAIL_USER: string;

	@IsString()
	EMAIL_PASS: string;

	@IsEnum(Environment)
	NODE_ENV: Environment;

	@IsEnum(DefaultRole)
	DEFAULT_ROL_FROM_USER: DefaultRole;

	@IsString({ each: true })
	@Validate(IsCorsValidConstraint)
	CORS: string[];

	@IsString()
	DATABASE_DIALECT: string;

	@IsString()
	DATABASE_HOST: string;

	@IsNumber()
	DATABASE_PORT: number;

	@IsString()
	POSTGRES_USER: string;

	@IsString()
	POSTGRES_PASSWORD: string;

	@IsString()
	POSTGRES_DB: string;

	@IsNumber()
	RATE_LIMIT_TTL: number;

	@IsNumber()
	RATE_LIMIT_LIMIT: number;

	@IsString()
	REDIS_URL: string;

	@IsNumber()
	REDIS_PORT: number;
}

export const validateEnv = (config: Record<string, any>) => {
	if (typeof config.CORS === 'string') {
		config.CORS = config.CORS.split(',').map(item => item.trim());
	}

	const validatedConfig = plainToClass(EnvironmentVariables, config, {
		enableImplicitConversion: true,
	});

	const errors = validateSync(validatedConfig, {
		skipMissingProperties: false,
	});

	if (errors.length > 0) {
		throw new Error(errors.toString());
	}

	return validatedConfig;
};
