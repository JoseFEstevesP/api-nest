import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as winston from 'winston';
import { LoggerService } from './logger.service';

// Mock de winston y sus componentes
vi.mock('winston', () => {
	const mockLogger = {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
		debug: vi.fn(),
		verbose: vi.fn(),
	};

	return {
		format: {
			printf: vi.fn(),
			timestamp: vi.fn(),
			combine: vi.fn(),
		},
		transports: {
			DailyRotateFile: vi.fn(),
			Console: vi.fn(),
		},
		createLogger: vi.fn().mockReturnValue(mockLogger),
	};
});

vi.mock('winston-daily-rotate-file');

describe('LoggerService', () => {
	let loggerService: LoggerService;
	let mockLogger: winston.Logger;

	beforeEach(async () => {
		// Limpiar todos los mocks antes de cada test
		vi.clearAllMocks();

		mockLogger = {
			info: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			debug: vi.fn(),
			verbose: vi.fn(),
		} as unknown as winston.Logger;

		vi.mocked(winston.createLogger).mockReturnValue(mockLogger);

		const module = await Test.createTestingModule({
			providers: [LoggerService],
		}).compile();

		loggerService = module.get<LoggerService>(LoggerService);
	});

	it('debería estar definido', () => {
		expect(loggerService).toBeDefined();
	});

	it('debería crear 3 loggers al inicializar', () => {
		expect(winston.createLogger).toHaveBeenCalledTimes(3);
	});

	describe('log', () => {
		it('debería registrar un mensaje info en ambos loggers', () => {
			const message = 'Mensaje de prueba';
			const context = 'TestContext';

			loggerService.log(message, context);

			expect(mockLogger.info).toHaveBeenCalledTimes(2);
			expect(mockLogger.info).toHaveBeenCalledWith(message, { context });
		});
	});

	describe('error', () => {
		it('debería registrar un mensaje error en ambos loggers', () => {
			const message = 'Error de prueba';
			const context = 'TestContext';

			loggerService.error(message, context);

			expect(mockLogger.error).toHaveBeenCalledTimes(2);
			expect(mockLogger.error).toHaveBeenCalledWith(message, { context });
		});
	});

	describe('warn', () => {
		it('debería registrar un mensaje warn', () => {
			const message = 'Advertencia de prueba';
			const context = 'TestContext';

			loggerService.warn(message, context);

			expect(mockLogger.warn).toHaveBeenCalledTimes(1);
			expect(mockLogger.warn).toHaveBeenCalledWith(message, { context });
		});
	});

	describe('debug', () => {
		it('debería registrar un mensaje debug', () => {
			const message = 'Debug de prueba';
			const context = 'TestContext';

			loggerService.debug(message, context);

			expect(mockLogger.debug).toHaveBeenCalledTimes(1);
			expect(mockLogger.debug).toHaveBeenCalledWith(message, { context });
		});
	});

	describe('verbose', () => {
		it('debería registrar un mensaje verbose', () => {
			const message = 'Verbose de prueba';
			const context = 'TestContext';

			loggerService.verbose(message, context);

			expect(mockLogger.verbose).toHaveBeenCalledTimes(1);
			expect(mockLogger.verbose).toHaveBeenCalledWith(message, { context });
		});
	});
});
