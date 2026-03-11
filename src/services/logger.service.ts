import { Injectable } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerService {
	private loggerInfo: Logger;
	private loggerError: Logger;
	private loggerAll: Logger;

	constructor() {
		this.createLoggers();
	}

	private createLoggers() {
		const textFormat = format.printf(
			({ level, message, timestamp, context }) => {
				return `${timestamp} [${level.toUpperCase()}]${context ? ` => [${context}]` : ''}: ${message}`;
			},
		);

		const dateFormat = format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' });

		this.loggerInfo = createLogger({
			level: 'info',
			format: format.combine(dateFormat, textFormat),
			transports: [
				new transports.DailyRotateFile({
					filename: 'logs/info/info-%DATE%.log',
					auditFile: 'logs/info/info-audit.json',
					datePattern: 'YYYY-MM-DD',
					maxFiles: '14d',
					level: 'info',
				}),
			],
		});

		this.loggerError = createLogger({
			level: 'error',
			format: format.combine(dateFormat, textFormat),
			transports: [
				new transports.DailyRotateFile({
					filename: 'logs/error/error-%DATE%.log',
					auditFile: 'logs/error/error-audit.json',
					datePattern: 'YYYY-MM-DD',
					maxFiles: '14d',
					level: 'error',
				}),
			],
		});

		this.loggerAll = createLogger({
			format: format.combine(dateFormat, textFormat),
			transports: [
				new transports.DailyRotateFile({
					filename: 'logs/all/all-%DATE%.log',
					auditFile: 'logs/all/all-audit.json',
					datePattern: 'YYYY-MM-DD',
					maxFiles: '14d',
				}),
				new transports.Console({
					format: format.combine(dateFormat, textFormat),
				}),
			],
		});
	}

	log(message: string, context?: string) {
		this.loggerAll.info(message, { context });
		this.loggerInfo.info(message, { context });
	}

	verbose(message: string, context?: string) {
		this.loggerAll.verbose(message, { context });
	}

	debug(message: string, context?: string) {
		this.loggerAll.debug(message, { context });
	}

	error(message: string, context?: string) {
		this.loggerAll.error(message, { context });
		this.loggerError.error(message, { context });
	}

	warn(message: string, context?: string) {
		this.loggerAll.warn(message, { context });
	}
}
