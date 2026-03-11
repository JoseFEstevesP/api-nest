import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorResponse {
	@ApiProperty({ example: 400 })
	statusCode!: number;

	@ApiProperty({ example: ['El correo electrónico es requerido'] })
	message!: string[] | string;

	@ApiProperty({ example: 'Bad Request' })
	error!: string;

	@ApiPropertyOptional({ example: '2024-01-15T10:30:00.000Z' })
	timestamp?: string;

	@ApiPropertyOptional({ example: 'POST' })
	method?: string;

	@ApiPropertyOptional({ example: '/api/v1/user' })
	path?: string;
}

export class ApiUnauthorizedResponse {
	@ApiProperty({ example: 401 })
	statusCode!: number;

	@ApiProperty({ example: 'Unauthorized' })
	message!: string;

	@ApiProperty({ example: 'Unauthorized' })
	error!: string;
}

export class ApiForbiddenResponse {
	@ApiProperty({ example: 403 })
	statusCode!: number;

	@ApiProperty({ example: 'Forbidden' })
	message!: string;

	@ApiProperty({ example: 'Forbidden' })
	error!: string;
}

export class ApiNotFoundResponse {
	@ApiProperty({ example: 404 })
	statusCode!: number;

	@ApiProperty({ example: 'Usuario no encontrado' })
	message!: string;

	@ApiProperty({ example: 'Not Found' })
	error!: string;
}

export class ApiTooManyRequestsResponse {
	@ApiProperty({ example: 429 })
	statusCode!: number;

	@ApiProperty({ example: 'Too Many Requests' })
	message!: string;

	@ApiProperty({ example: 'Too Many Requests' })
	error!: string;
}

export class ApiValidationError {
	@ApiProperty({ example: 'email' })
	field!: string;

	@ApiProperty({ example: 'El correo electrónico es requerido' })
	message!: string;
}

export class ApiValidationErrorResponse {
	@ApiProperty({ example: 400 })
	statusCode!: number;

	@ApiProperty({ type: [ApiValidationError] })
	message!: ApiValidationError[];

	@ApiProperty({ example: 'Bad Request' })
	error!: string;
}
