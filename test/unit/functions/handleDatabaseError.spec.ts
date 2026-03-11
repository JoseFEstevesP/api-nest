import { handleDatabaseError } from '@/functions/handleDatabaseError';
import { Logger, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';

describe('handleDatabaseError', () => {
	let mockLogger: Logger;

	beforeEach(() => {
		mockLogger = {
			error: jest.fn(),
		} as any;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('when error is UniqueConstraintError', () => {
		it('should throw ConflictException with field name in message', () => {
			const error = new UniqueConstraintError({
				message: 'Duplicate entry',
				errors: [
					{
						message: 'Value must be unique',
						type: 'unique',
						path: 'email',
						value: 'test@example.com',
						origin: 'DB',
						instance: null,
					},
				],
			});

			expect(() => {
				handleDatabaseError(error, mockLogger, 'la creación del usuario');
			}).toThrow(ConflictException);

			expect(() => {
				handleDatabaseError(error, mockLogger, 'la creación del usuario');
			}).toThrow('El valor para email ya está en uso.');
		});

		it('should throw ConflictException with multiple fields', () => {
			const error = new UniqueConstraintError({
				message: 'Duplicate entry',
				errors: [
					{
						message: 'Value must be unique',
						type: 'unique',
						path: 'email',
						value: 'test@example.com',
						origin: 'DB',
						instance: null,
					},
					{
						message: 'Value must be unique',
						type: 'unique',
						path: 'phone',
						value: '1234567890',
						origin: 'DB',
						instance: null,
					},
				],
			});

			expect(() => {
				handleDatabaseError(error, mockLogger, 'la creación del usuario');
			}).toThrow('El valor para email, phone ya está en uso.');
		});

		it('should not call logger.error for UniqueConstraintError', () => {
			const error = new UniqueConstraintError({
				message: 'Duplicate entry',
				errors: [
					{
						message: 'Value must be unique',
						type: 'unique',
						path: 'email',
						value: 'test@example.com',
						origin: 'DB',
						instance: null,
					},
				],
			});

			try {
				handleDatabaseError(error, mockLogger, 'la creación del usuario');
			} catch (e) {
				// Expected to throw
			}

			expect(mockLogger.error).not.toHaveBeenCalled();
		});
	});

	describe('when error is not UniqueConstraintError', () => {
		it('should call logger.error with context', () => {
			const error = new Error('Database connection failed');

			try {
				handleDatabaseError(error, mockLogger, 'la creación del usuario');
			} catch (e) {
				// Expected to throw
			}

			expect(mockLogger.error).toHaveBeenCalledWith(
				'Error no esperado durante la creación del usuario',
				expect.any(String),
			);
		});

		it('should throw InternalServerErrorException', () => {
			const error = new Error('Database connection failed');

			expect(() => {
				handleDatabaseError(error, mockLogger, 'la creación del usuario');
			}).toThrow(InternalServerErrorException);

			expect(() => {
				handleDatabaseError(error, mockLogger, 'la creación del usuario');
			}).toThrow('Ocurrió un error inesperado durante la creación del usuario.');
		});

		it('should include error stack in logger', () => {
			const error = new Error('Database connection failed');

			try {
				handleDatabaseError(error, mockLogger, 'la creación del usuario');
			} catch (e) {
				// Expected to throw
			}

			expect(mockLogger.error).toHaveBeenCalledWith(
				expect.any(String),
				expect.any(String), // error stack
			);
		});

		it('should handle different error types', () => {
			const errors = [
				new Error('Connection timeout'),
				new TypeError('Invalid type'),
				new ReferenceError('Undefined variable'),
			];

			errors.forEach(error => {
				try {
					handleDatabaseError(error, mockLogger, 'operación');
				} catch (e) {
					expect(e).toBeInstanceOf(InternalServerErrorException);
				}
			});
		});
	});

	describe('context message', () => {
		it('should include context in error message', () => {
			const error = new Error('Some error');
			const contexts = [
				'la creación del usuario',
				'la actualización del rol',
				'la eliminación del audit',
			];

			contexts.forEach(context => {
				try {
					handleDatabaseError(error, mockLogger, context);
				} catch (e) {
					expect((e as InternalServerErrorException).message).toContain(
						context,
					);
				}
			});
		});
	});
});
