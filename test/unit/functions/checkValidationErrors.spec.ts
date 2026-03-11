import { checkValidationErrors } from '@/functions/validationFunction/checkValidationErrors';
import { ConflictException } from '@nestjs/common';

describe('checkValidationErrors', () => {
	describe('when status is true', () => {
		it('should throw ConflictException with default message', () => {
			expect(() => {
				checkValidationErrors({
					data: { status: true },
					msg: {
						validation: {
							disability: 'Disabled item',
							default: 'Item already exists',
						},
					},
					name: 'email',
				});
			}).toThrow(ConflictException);

			expect(() => {
				checkValidationErrors({
					data: { status: true },
					msg: {
						validation: {
							disability: 'Disabled item',
							default: 'Item already exists',
						},
					},
					name: 'email',
				});
			}).toThrow('Item already exists');
		});

		it('should throw with correct error structure', () => {
			try {
				checkValidationErrors({
					data: { status: true },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default error',
						},
					},
					name: 'email',
				});
			} catch (error) {
				const exception = error as ConflictException;
				const response = exception.getResponse() as any;

				expect(response).toHaveProperty('email');
				expect(response.email).toHaveProperty('message');
				expect(response.email.message).toBe('Default error');
			}
		});

		it('should throw with status true (explicit)', () => {
			expect(() => {
				checkValidationErrors({
					data: { status: true as boolean },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default',
						},
					},
					name: 'phone',
				});
			}).toThrow('Default');
		});
	});

	describe('when status is false', () => {
		it('should throw ConflictException with disability message', () => {
			expect(() => {
				checkValidationErrors({
					data: { status: false },
					msg: {
						validation: {
							disability: 'Item is disabled',
							default: 'Item exists',
						},
					},
					name: 'email',
				});
			}).toThrow('Item is disabled');
		});

		it('should throw with correct error structure for disabled', () => {
			try {
				checkValidationErrors({
					data: { status: false },
					msg: {
						validation: {
							disability: 'This account is disabled',
							default: 'Account exists',
						},
					},
					name: 'user',
				});
			} catch (error) {
				const exception = error as ConflictException;
				const response = exception.getResponse() as any;

				expect(response).toHaveProperty('user');
				expect(response.user).toHaveProperty('message');
				expect(response.user.message).toBe('This account is disabled');
			}
		});
	});

	describe('error message structure', () => {
		it('should create error object with field name as key', () => {
			const fields = ['email', 'phone', 'username', 'ci'];

			fields.forEach(field => {
				try {
					checkValidationErrors({
						data: { status: true },
						msg: {
							validation: {
								disability: 'Disabled',
								default: 'Exists',
							},
						},
						name: field,
					});
				} catch (error) {
					const exception = error as ConflictException;
					const response = exception.getResponse() as any;

					expect(response).toHaveProperty(field);
				}
			});
		});

		it('should include message property in error response', () => {
			try {
				checkValidationErrors({
					data: { status: true },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Already registered',
						},
					},
					name: 'email',
				});
			} catch (error) {
				const exception = error as ConflictException;
				const response = exception.getResponse() as any;

				expect(response.email).toEqual({
					message: 'Already registered',
				});
			}
		});
	});

	describe('with different message types', () => {
		it('should handle user messages', () => {
			const userMessages = {
				validation: {
					disability: 'Este usuario está deshabilitado',
					default: 'Este usuario ya existe',
				},
			};

			expect(() => {
				checkValidationErrors({
					data: { status: true },
					msg: userMessages,
					name: 'usuario',
				});
			}).toThrow('Este usuario ya existe');
		});

		it('should handle rol messages', () => {
			const rolMessages = {
				validation: {
					disability: 'Este rol está deshabilitado',
					default: 'Este rol ya existe',
				},
			};

			expect(() => {
				checkValidationErrors({
					data: { status: false },
					msg: rolMessages,
					name: 'rol',
				});
			}).toThrow('Este rol está deshabilitado');
		});

		it('should handle audit messages', () => {
			const auditMessages = {
				validation: {
					disability: 'Este registro está deshabilitado',
					default: 'Este registro ya existe',
				},
			};

			expect(() => {
				checkValidationErrors({
					data: { status: true },
					msg: auditMessages,
					name: 'audit',
				});
			}).toThrow('Este registro ya existe');
		});
	});

	describe('edge cases', () => {
		it('should handle empty name', () => {
			try {
				checkValidationErrors({
					data: { status: true },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default',
						},
					},
					name: '',
				});
			} catch (error) {
				const exception = error as ConflictException;
				const response = exception.getResponse() as any;

				expect(response).toHaveProperty('');
			}
		});

		it('should handle long field names', () => {
			const longName = 'very_long_field_name_that_exceeds_normal_length';

			try {
				checkValidationErrors({
					data: { status: true },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default',
						},
					},
					name: longName,
				});
			} catch (error) {
				const exception = error as ConflictException;
				const response = exception.getResponse() as any;

				expect(response).toHaveProperty(longName);
			}
		});

		it('should handle special characters in field name', () => {
			const specialName = 'field-name_with.special$chars';

			try {
				checkValidationErrors({
					data: { status: true },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default',
						},
					},
					name: specialName,
				});
			} catch (error) {
				const exception = error as ConflictException;
				const response = exception.getResponse() as any;

				expect(response).toHaveProperty(specialName);
			}
		});

		it('should handle unicode characters in field name', () => {
			const unicodeName = 'campo_ñandú';

			try {
				checkValidationErrors({
					data: { status: true },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default',
						},
					},
					name: unicodeName,
				});
			} catch (error) {
				const exception = error as ConflictException;
				const response = exception.getResponse() as any;

				expect(response).toHaveProperty(unicodeName);
			}
		});
	});

	describe('with status edge cases', () => {
		it('should treat status as true when explicitly true', () => {
			expect(() => {
				checkValidationErrors({
					data: { status: true as boolean },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default',
						},
					},
					name: 'test',
				});
			}).toThrow('Default');
		});

		it('should treat status as false when explicitly false', () => {
			expect(() => {
				checkValidationErrors({
					data: { status: false as boolean },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default',
						},
					},
					name: 'test',
				});
			}).toThrow('Disabled');
		});

		it('should treat undefined status as false', () => {
			expect(() => {
				checkValidationErrors({
					data: { status: undefined },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default',
						},
					},
					name: 'test',
				});
			}).toThrow('Disabled');
		});

		it('should treat missing status as false', () => {
			expect(() => {
				checkValidationErrors({
					data: {} as any,
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default',
						},
					},
					name: 'test',
				});
			}).toThrow('Disabled');
		});
	});

	describe('ConflictException properties', () => {
		it('should throw ConflictException with correct status code', () => {
			try {
				checkValidationErrors({
					data: { status: true },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default',
						},
					},
					name: 'test',
				});
			} catch (error) {
				const exception = error as ConflictException;
				expect(exception.getStatus()).toBe(409);
			}
		});

		it('should throw ConflictException that is catchable', () => {
			const fn = () => {
				checkValidationErrors({
					data: { status: true },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default',
						},
					},
					name: 'test',
				});
			};

			expect(fn).toThrow(ConflictException);
			expect(fn).toThrow(Error);
		});
	});
});
