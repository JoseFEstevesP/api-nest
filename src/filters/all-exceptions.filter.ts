import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { LoggerService } from '../services/logger.service';
import { globalMsg } from '../globalMsg';
import { errorResponse } from '@/dto/api-response-wrapper.dto';

const HTTP_STATUS_NAMES: Record<number, string> = {
	[HttpStatus.BAD_REQUEST]: 'Bad Request',
	[HttpStatus.UNAUTHORIZED]: 'Unauthorized',
	[HttpStatus.FORBIDDEN]: 'Forbidden',
	[HttpStatus.NOT_FOUND]: 'Not Found',
	[HttpStatus.CONFLICT]: 'Conflict',
	[HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
	[HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
	[HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
	[HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
};

function getHttpStatusName(code: number): string {
	return HTTP_STATUS_NAMES[code] || 'Error';
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	constructor(
		private readonly httpAdapterHost: HttpAdapterHost,
		private readonly logger: LoggerService,
	) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		const request = ctx.getRequest();

		if (
			exception &&
			typeof exception === 'object' &&
			'name' in exception &&
			exception.name === 'TokenExpiredError'
		) {
			const tokenExpired = exception as { name: string; message: string };
			const isRefreshToken = tokenExpired.message.includes('refresh');
			const tokenType = isRefreshToken ? 'refresh' : 'access';

			const message = tokenType === 'access'
				? 'Token de acceso expirado'
				: 'Token de refresco expirado';

			const responseBody = errorResponse(
				HttpStatus.UNAUTHORIZED,
				message,
				[{ field: 'token', message }],
			);

			httpAdapter.reply(ctx.getResponse(), responseBody, HttpStatus.UNAUTHORIZED);
			return;
		}

		if (
			exception &&
			typeof exception === 'object' &&
			'name' in exception &&
			exception.name === 'ThrottlerException'
		) {
			const responseBody = errorResponse(
				HttpStatus.TOO_MANY_REQUESTS,
				globalMsg.throttler,
				[{ field: 'all', message: globalMsg.throttler }],
			);

			this.logger.warn(
				`ThrottlerException: Demasiadas solicitudes - [${request.method}] ${request.url}`,
			);

			if (!ctx.getResponse().headersSent) {
				httpAdapter.reply(
					ctx.getResponse(),
					responseBody,
					HttpStatus.TOO_MANY_REQUESTS,
				);
			}
			return;
		}

		const httpStatus =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		// Verificar si la excepción tiene un getResponse() personalizado (Extended Exceptions)
		if (
			exception instanceof HttpException &&
			'getResponse' in exception &&
			typeof (exception as unknown as { getResponse: unknown }).getResponse === 'function'
		) {
			const customResponse = (exception as unknown as { getResponse: () => unknown }).getResponse();
			if (customResponse && typeof customResponse === 'object' && customResponse !== null) {
				const custom = customResponse as { success?: boolean; error?: unknown };
				if ('success' in custom && custom.success === false && 'error' in custom) {
					this.logger.error(
						`[${request.method}] ${request.url} - Status: ${httpStatus}`,
						exception instanceof Error ? exception.stack : JSON.stringify(exception),
					);
					if (!ctx.getResponse().headersSent) {
						httpAdapter.reply(ctx.getResponse(), customResponse, httpStatus);
					}
					return;
				}
			}
		}

		const exceptionResponse = exception instanceof HttpException
			? exception.getResponse()
			: 'Error interno del servidor';

		let message: string;
		let details: Record<string, { message: string }> | undefined;

		if (typeof exceptionResponse === 'string') {
			message = exceptionResponse;
		} else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
			const response = exceptionResponse as Record<string, unknown>;

			// Case 1: Response has 'message' key with object containing errors
			if ('message' in response && typeof response.message === 'object' && response.message !== null && !Array.isArray(response.message)) {
				const msg = response.message as Record<string, { message?: string }>;
				const keys = Object.keys(msg);
				
				if (keys.length > 0) {
					const firstValue = msg[keys[0]];
					if (typeof firstValue === 'object' && firstValue !== null && 'message' in firstValue) {
						details = {};
						for (const key of keys) {
							const value = msg[key];
							if (typeof value === 'object' && value !== null && 'message' in value) {
								details[key] = { message: String(value.message) };
							}
						}
						message = 'Error de validación';
					} else {
						message = getHttpStatusName(httpStatus);
					}
				} else {
					message = getHttpStatusName(httpStatus);
				}
			}
			// Case 2: Response has 'message' key with array (class-validator default format)
			else if ('message' in response && Array.isArray(response.message)) {
				details = {};
				for (const err of response.message as Array<{ property: string; constraints?: Record<string, string> }>) {
					if (err.constraints) {
						const firstConstraint = Object.values(err.constraints)[0];
						details[err.property] = { message: firstConstraint };
					}
				}
				message = 'Error de validación';
			}
			// Case 3: Response IS the error object directly (like from ValidationPipe exceptionFactory)
			else if (!('message' in response)) {
				const keys = Object.keys(response);
				if (keys.length > 0) {
					const firstValue = response[keys[0]];
					if (typeof firstValue === 'object' && firstValue !== null && 'message' in firstValue) {
						details = {};
						for (const key of keys) {
							const value = response[key];
							if (typeof value === 'object' && value !== null && 'message' in value) {
								details[key] = { message: String((value as { message: unknown }).message) };
							}
						}
						message = 'Error de validación';
					} else {
						message = getHttpStatusName(httpStatus);
					}
				} else {
					message = getHttpStatusName(httpStatus);
				}
			}
			// Case 4: Response has 'message' as string
			else if (typeof response.message === 'string') {
				message = response.message;
			} else {
				message = getHttpStatusName(httpStatus);
			}
		} else {
			message = 'Error interno del servidor';
		}

		const responseBody = errorResponse(httpStatus, message, details);

		this.logger.error(
			`[${request.method}] ${request.url} - Status: ${httpStatus}`,
			exception instanceof Error ? exception.stack : JSON.stringify(exception),
		);

		if (!ctx.getResponse().headersSent) {
			httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
		}
	}
}
