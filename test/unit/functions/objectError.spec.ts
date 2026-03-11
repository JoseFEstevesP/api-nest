import { objectError } from '@/functions/objectError';

describe('objectError', () => {
	describe('basic functionality', () => {
		it('should return object with field name as key', () => {
			const result = objectError({ name: 'email', msg: 'Invalid email' });

			expect(result).toHaveProperty('email');
		});

		it('should return object with message property', () => {
			const result = objectError({ name: 'email', msg: 'Invalid email' });

			expect(result.email).toHaveProperty('message');
			expect(result.email.message).toBe('Invalid email');
		});

		it('should return correct structure', () => {
			const result = objectError({ name: 'email', msg: 'Invalid email' });

			expect(result).toEqual({
				email: {
					message: 'Invalid email',
				},
			});
		});
	});

	describe('with different field names', () => {
		it('should handle email field', () => {
			const result = objectError({ name: 'email', msg: 'Email is required' });

			expect(result).toEqual({
				email: { message: 'Email is required' },
			});
		});

		it('should handle phone field', () => {
			const result = objectError({ name: 'phone', msg: 'Phone is invalid' });

			expect(result).toEqual({
				phone: { message: 'Phone is invalid' },
			});
		});

		it('should handle password field', () => {
			const result = objectError({ name: 'password', msg: 'Password too weak' });

			expect(result).toEqual({
				password: { message: 'Password too weak' },
			});
		});

		it('should handle username field', () => {
			const result = objectError({ name: 'username', msg: 'Username taken' });

			expect(result).toEqual({
				username: { message: 'Username taken' },
			});
		});

		it('should handle ci field', () => {
			const result = objectError({ name: 'ci', msg: 'CI is invalid' });

			expect(result).toEqual({
				ci: { message: 'CI is invalid' },
			});
		});
	});

	describe('with different message types', () => {
		it('should handle required field message', () => {
			const result = objectError({ name: 'email', msg: 'This field is required' });

			expect(result.email.message).toBe('This field is required');
		});

		it('should handle invalid format message', () => {
			const result = objectError({ name: 'email', msg: 'Invalid format' });

			expect(result.email.message).toBe('Invalid format');
		});

		it('should handle already exists message', () => {
			const result = objectError({ name: 'email', msg: 'Already exists' });

			expect(result.email.message).toBe('Already exists');
		});

		it('should handle too short message', () => {
			const result = objectError({ name: 'password', msg: 'Too short' });

			expect(result.password.message).toBe('Too short');
		});

		it('should handle too long message', () => {
			const result = objectError({ name: 'username', msg: 'Too long' });

			expect(result.username.message).toBe('Too long');
		});

		it('should handle custom message', () => {
			const customMsg = 'Custom validation error';
			const result = objectError({ name: 'field', msg: customMsg });

			expect(result.field.message).toBe(customMsg);
		});
	});

	describe('with Spanish messages', () => {
		it('should handle Spanish required message', () => {
			const result = objectError({
				name: 'email',
				msg: 'Este campo es obligatorio',
			});

			expect(result.email.message).toBe('Este campo es obligatorio');
		});

		it('should handle Spanish invalid format message', () => {
			const result = objectError({
				name: 'email',
				msg: 'Formato inválido',
			});

			expect(result.email.message).toBe('Formato inválido');
		});

		it('should handle Spanish already exists message', () => {
			const result = objectError({
				name: 'email',
				msg: 'Ya está en uso',
			});

			expect(result.email.message).toBe('Ya está en uso');
		});

		it('should handle Spanish validation messages from userMessages', () => {
			const messages = [
				'Este campo no puede estar vacío',
				'Este campo debe ser de tipo cadena de texto',
				'Este campo debe tener entre 3 y 255 caracteres',
				'El campo email no es válido',
				'La contraseña debe tener un mínimo de 8 caracteres',
			];

			messages.forEach(msg => {
				const result = objectError({ name: 'field', msg });
				expect(result.field.message).toBe(msg);
			});
		});
	});

	describe('edge cases', () => {
		it('should handle empty field name', () => {
			const result = objectError({ name: '', msg: 'Error' });

			expect(result).toEqual({
				'': { message: 'Error' },
			});
		});

		it('should handle empty message', () => {
			const result = objectError({ name: 'field', msg: '' });

			expect(result).toEqual({
				field: { message: '' },
			});
		});

		it('should handle long field name', () => {
			const longName = 'very_long_field_name_that_exceeds_normal_length';
			const result = objectError({ name: longName, msg: 'Error' });

			expect(result).toHaveProperty(longName);
			expect(result[longName].message).toBe('Error');
		});

		it('should handle long message', () => {
			const longMsg = 'This is a very long error message that exceeds normal length and contains lots of details about what went wrong';
			const result = objectError({ name: 'field', msg: longMsg });

			expect(result.field.message).toBe(longMsg);
		});

		it('should handle special characters in field name', () => {
			const result = objectError({
				name: 'field-name_with.special$chars',
				msg: 'Error',
			});

			expect(result).toHaveProperty('field-name_with.special$chars');
		});

		it('should handle special characters in message', () => {
			const result = objectError({
				name: 'field',
				msg: 'Error with special chars: @#$%^&*()',
			});

			expect(result.field.message).toBe('Error with special chars: @#$%^&*()');
		});

		it('should handle unicode characters', () => {
			const result = objectError({
				name: 'campo_ñandú',
				msg: 'Error con caracteres unicode: áéíóúñ',
			});

			expect(result['campo_ñandú'].message).toBe(
				'Error con caracteres unicode: áéíóúñ',
			);
		});

		it('should handle newlines in message', () => {
			const result = objectError({
				name: 'field',
				msg: 'Error line 1\nError line 2',
			});

			expect(result.field.message).toBe('Error line 1\nError line 2');
		});
	});

	describe('return type', () => {
		it('should return object type', () => {
			const result = objectError({ name: 'field', msg: 'Error' });

			expect(typeof result).toBe('object');
			expect(Array.isArray(result)).toBe(false);
		});

		it('should return object with single key', () => {
			const result = objectError({ name: 'field', msg: 'Error' });

			expect(Object.keys(result).length).toBe(1);
		});

		it('should return nested object structure', () => {
			const result = objectError({ name: 'field', msg: 'Error' });

			expect(typeof result.field).toBe('object');
			expect(typeof result.field.message).toBe('string');
		});
	});

	describe('usage with ConflictException', () => {
		it('should create error object compatible with ConflictException', () => {
			const errorObj = objectError({ name: 'email', msg: 'Email exists' });

			// Verify structure is compatible
			expect(errorObj).toHaveProperty('email');
			expect(errorObj.email).toHaveProperty('message');
			expect(typeof errorObj.email.message).toBe('string');
		});

		it('should work with multiple fields when called multiple times', () => {
			const errors = {
				...objectError({ name: 'email', msg: 'Email exists' }),
				...objectError({ name: 'phone', msg: 'Phone exists' }),
			};

			expect(errors).toHaveProperty('email');
			expect(errors).toHaveProperty('phone');
		});
	});
});
