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
import { type Dialect } from 'sequelize';
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
	declare PORT: number;

	@IsString()
	@MinLength(64)
	declare JWT_SECRET: string;

	@IsString()
	@MinLength(64)
	declare JWT_REFRESH_SECRET: string;

	@IsString()
	declare EMAIL_HOST: string;

	@IsEmail()
	declare EMAIL_USER: string;

	@IsString()
	declare EMAIL_PASS: string;

	@IsEnum(Environment)
	declare NODE_ENV: Environment;

	@IsEnum(DefaultRole)
	declare DEFAULT_ROL_FROM_USER: DefaultRole;

	@IsString({ each: true })
	@Validate(IsCorsValidConstraint)
	declare CORS: string[];

	@IsString()
	declare DATABASE_DIALECT: Dialect;

	@IsString()
	declare DATABASE_HOST: string;

	@IsNumber()
	declare DATABASE_PORT: number;

	@IsString()
	declare POSTGRES_USER: string;

	@IsString()
	declare POSTGRES_PASSWORD: string;

	@IsString()
	declare POSTGRES_DB: string;

	@IsNumber()
	declare RATE_LIMIT_TTL: number;

	@IsNumber()
	declare RATE_LIMIT_LIMIT: number;

	@IsString()
	declare REDIS_URL: string;

	@IsNumber()
	declare SALT_ROUNDS: number;

	@IsString()
	declare GOOGLE_CLIENT_ID: string;

	@IsString()
	declare GOOGLE_SECRET: string;

	@IsString()
	declare GOOGLE_CALLBACK_URL: string;

	@IsString()
	declare FRONT_END_URL: string;
}

export const validateEnv = (config: Record<string, unknown>) => {
	if (typeof config.CORS === 'string') {
		config.CORS = config.CORS.split(',').map(item => item.trim());
	}

	const numericFields = [
		'PORT',
		'SALT_ROUNDS',
		'DATABASE_PORT',
		'RATE_LIMIT_TTL',
		'RATE_LIMIT_LIMIT',
	];
	numericFields.forEach(field => {
		if (config[field] && typeof config[field] === 'string') {
			config[field] = parseInt(config[field], 10);
		}
	});

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
