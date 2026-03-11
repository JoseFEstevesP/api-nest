import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { checkValidationErrors } from '@/functions/validationFunction/checkValidationErrors';

describe('validatePropertyData', () => {
	describe('when data is undefined or not provided', () => {
		it('should not throw when data is undefined', () => {
			expect(() => {
				validatePropertyData({
					property: { email: 'test@example.com' },
					data: undefined,
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default error',
						},
					},
				});
			}).not.toThrow();
		});

		it('should return early when data is undefined', () => {
			const result = validatePropertyData({
				property: { email: 'test@example.com' },
				data: undefined,
				msg: {
					validation: {
						disability: 'Disabled',
						default: 'Default error',
					},
				},
			});

			expect(result).toBeUndefined();
		});
	});

	describe('when property matches data', () => {
		it('should call checkValidationErrors when email matches', () => {
			const mockCheckErrors = jest.fn();

			validatePropertyData({
				property: { email: 'test@example.com' },
				data: { email: 'test@example.com', status: true },
				msg: {
					validation: {
						disability: 'Disabled',
						default: 'Default error',
					},
				},
				checkErrors: mockCheckErrors,
			});

			expect(mockCheckErrors).toHaveBeenCalledWith({
				data: { email: 'test@example.com', status: true },
				msg: {
					validation: {
						disability: 'Disabled',
						default: 'Default error',
					},
				},
				name: 'email',
			});
		});

		it('should call checkValidationErrors for each matching property', () => {
			const mockCheckErrors = jest.fn();

			validatePropertyData({
				property: { email: 'test@example.com', phone: '1234567890' },
				data: { email: 'test@example.com', phone: '1234567890', status: true },
				msg: {
					validation: {
						disability: 'Disabled',
						default: 'Default error',
					},
				},
				checkErrors: mockCheckErrors,
			});

			expect(mockCheckErrors).toHaveBeenCalledTimes(2);
		});

		it('should throw ConflictException when status is true', () => {
			expect(() => {
				validatePropertyData({
					property: { email: 'test@example.com' },
					data: { email: 'test@example.com', status: true },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default error',
						},
					},
				});
			}).toThrow('Default error');
		});

		it('should throw ConflictException with disability message when status is false', () => {
			expect(() => {
				validatePropertyData({
					property: { email: 'test@example.com' },
					data: { email: 'test@example.com', status: false },
					msg: {
						validation: {
							disability: 'This is disabled',
							default: 'Default error',
						},
					},
				});
			}).toThrow('This is disabled');
		});
	});

	describe('when property does not match data', () => {
		it('should not throw when email does not match', () => {
			expect(() => {
				validatePropertyData({
					property: { email: 'different@example.com' },
					data: { email: 'test@example.com', status: true },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default error',
						},
					},
				});
			}).not.toThrow();
		});

		it('should not call checkValidationErrors when no match', () => {
			const mockCheckErrors = jest.fn();

			validatePropertyData({
				property: { email: 'different@example.com' },
				data: { email: 'test@example.com', status: true },
				msg: {
					validation: {
						disability: 'Disabled',
						default: 'Default error',
					},
				},
				checkErrors: mockCheckErrors,
			});

			expect(mockCheckErrors).not.toHaveBeenCalled();
		});
	});

	describe('with custom checkErrors function', () => {
		it('should use custom checkErrors when provided', () => {
			const customCheckErrors = jest.fn();

			validatePropertyData({
				property: { email: 'test@example.com' },
				data: { email: 'test@example.com', status: true },
				msg: {
					validation: {
						disability: 'Disabled',
						default: 'Default error',
					},
				},
				checkErrors: customCheckErrors,
			});

			expect(customCheckErrors).toHaveBeenCalled();
		});

		it('should pass correct parameters to custom checkErrors', () => {
			const customCheckErrors = jest.fn();

			validatePropertyData({
				property: { phone: '1234567890' },
				data: { phone: '1234567890', status: false },
				msg: {
					validation: {
						disability: 'Custom disabled',
						default: 'Custom default',
					},
				},
				checkErrors: customCheckErrors,
			});

			expect(customCheckErrors).toHaveBeenCalledWith({
				data: { phone: '1234567890', status: false },
				msg: {
					validation: {
						disability: 'Custom disabled',
						default: 'Custom default',
					},
				},
				name: 'phone',
			});
		});
	});

	describe('with multiple properties', () => {
		it('should check all properties', () => {
			const mockCheckErrors = jest.fn();

			validatePropertyData({
				property: {
					email: 'test@example.com',
					phone: '1234567890',
					ci: '12345678',
				},
				data: {
					email: 'test@example.com',
					phone: '1234567890',
					ci: '87654321',
					status: true,
				},
				msg: {
					validation: {
						disability: 'Disabled',
						default: 'Default error',
					},
				},
				checkErrors: mockCheckErrors,
			});

			// Should check email and phone (matching), but not ci (not matching)
			expect(mockCheckErrors).toHaveBeenCalledTimes(2);
		});

		it('should stop at first match and throw', () => {
			expect(() => {
				validatePropertyData({
					property: {
						email: 'test@example.com',
						phone: '1234567890',
					},
					data: {
						email: 'test@example.com',
						phone: '1234567890',
						status: true,
					},
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default error',
						},
					},
				});
			}).toThrow();
		});
	});

	describe('edge cases', () => {
		it('should handle empty property object', () => {
			expect(() => {
				validatePropertyData({
					property: {},
					data: { email: 'test@example.com', status: true },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default error',
						},
					},
				});
			}).not.toThrow();
		});

		it('should handle data with extra properties', () => {
			expect(() => {
				validatePropertyData({
					property: { email: 'test@example.com' },
					data: {
						email: 'test@example.com',
						phone: '1234567890',
						status: true,
						extra: 'value',
					},
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default error',
						},
					},
				});
			}).toThrow();
		});

		it('should handle data with status as undefined', () => {
			expect(() => {
				validatePropertyData({
					property: { email: 'test@example.com' },
					data: { email: 'test@example.com', status: undefined },
					msg: {
						validation: {
							disability: 'Disabled',
							default: 'Default error',
						},
					},
				});
			}).toThrow('Default error');
		});
	});

	describe('with user messages', () => {
		it('should use userMessages validation messages', () => {
			const userMessages = {
				validation: {
					disability: 'Este usuario ya está registrado, pero está deshabilitado',
					default: 'Este usuario ya está registrado',
				},
			};

			expect(() => {
				validatePropertyData({
					property: { email: 'test@example.com' },
					data: { email: 'test@example.com', status: true },
					msg: userMessages,
				});
			}).toThrow('Este usuario ya está registrado');
		});

		it('should use disability message when status is false', () => {
			const userMessages = {
				validation: {
					disability: 'Este usuario ya está registrado, pero está deshabilitado',
					default: 'Este usuario ya está registrado',
				},
			};

			expect(() => {
				validatePropertyData({
					property: { email: 'test@example.com' },
					data: { email: 'test@example.com', status: false },
					msg: userMessages,
				});
			}).toThrow('Este usuario ya está registrado, pero está deshabilitado');
		});
	});
});
