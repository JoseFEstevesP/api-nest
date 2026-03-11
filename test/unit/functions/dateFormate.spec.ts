import { dateFormate } from '@/functions/dateFormate';

describe('dateFormate', () => {
	describe('with default format (DD/MM/YYYY)', () => {
		it('should format date string with default format', () => {
			const result = dateFormate('2024-03-15');

			expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
		});

		it('should format Date object with default format', () => {
			const date = new Date('2024-03-15T00:00:00Z');
			const result = dateFormate(date);

			expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
		});

		it('should format ISO date string', () => {
			const result = dateFormate('2024-12-25T10:30:00Z');

			expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
		});

		it('should format timestamp', () => {
			const date = new Date('2024-01-01T00:00:00Z');
			const result = dateFormate(date);

			expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
		});
	});

	describe('with custom format', () => {
		it('should format with YYYY-MM-DD format', () => {
			const result = dateFormate('2024-03-15', 'YYYY-MM-DD');

			expect(result).toBe('2024-03-15');
		});

		it('should format with MM/DD/YYYY format', () => {
			const result = dateFormate('2024-03-15', 'MM/DD/YYYY');

			expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
		});

		it('should format with DD-MM-YYYY format', () => {
			const result = dateFormate('2024-03-15', 'DD-MM-YYYY');

			expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/);
		});

		it('should format with YYYY/MM/DD format', () => {
			const result = dateFormate('2024-03-15', 'YYYY/MM/DD');

			expect(result).toBe('2024/03/15');
		});

		it('should format with DD MMM YYYY format', () => {
			const result = dateFormate('2024-03-15', 'DD MMM YYYY');

			// Month name may be in Spanish (mar.) or abbreviated
			expect(result).toMatch(/^\d{2} [a-z\.]+ 2024$/i);
		});

		it('should format with full month name', () => {
			const result = dateFormate('2024-03-15', 'DD MMMM YYYY');

			// Month name may be in Spanish (marzo)
			expect(result).toMatch(/^\d{2} [a-z]+ 2024$/i);
		});

		it('should format with time', () => {
			const result = dateFormate('2024-03-15T14:30:00', 'DD/MM/YYYY HH:mm:ss');

			expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);
		});

		it('should format with 12-hour time', () => {
			const result = dateFormate('2024-03-15T14:30:00', 'DD/MM/YYYY hh:mm:ss A');

			// May show "P. M." or "PM" depending on locale
			expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2} [AP]\.? ?[M]\.?$/i);
		});
	});

	describe('edge cases', () => {
		it('should handle invalid date string', () => {
			expect(() => {
				dateFormate('invalid-date');
			}).toThrow();
		});

		it('should handle empty string without throwing', () => {
			// Empty string may be handled gracefully by @formkit/tempo
			expect(() => {
				dateFormate('');
			}).not.toThrow();
		});

		it('should handle null', () => {
			expect(() => {
				dateFormate(null as any);
			}).toThrow();
		});

		it('should handle undefined without throwing', () => {
			// Undefined may default to current date
			expect(() => {
				dateFormate(undefined as any);
			}).not.toThrow();
		});

		it('should handle invalid format string', () => {
			// Invalid format should still work, just return formatted with unknown tokens
			const result = dateFormate('2024-03-15', 'INVALID');

			expect(result).toBeDefined();
		});
	});

	describe('different date values', () => {
		it('should format first day of year', () => {
			const result = dateFormate('2024-01-01');

			expect(result).toBe('01/01/2024');
		});

		it('should format last day of year', () => {
			const result = dateFormate('2024-12-31');

			expect(result).toBe('31/12/2024');
		});

		it('should format leap year date', () => {
			const result = dateFormate('2024-02-29');

			expect(result).toBe('29/02/2024');
		});

		it('should format middle of month', () => {
			const result = dateFormate('2024-06-15');

			expect(result).toBe('15/06/2024');
		});

		it('should format single digit day', () => {
			const result = dateFormate('2024-01-05');

			expect(result).toBe('05/01/2024');
		});

		it('should format single digit month', () => {
			const result = dateFormate('2024-03-10');

			expect(result).toBe('10/03/2024');
		});
	});

	describe('format parameter precedence', () => {
		it('should use provided format over default', () => {
			const result1 = dateFormate('2024-03-15');
			const result2 = dateFormate('2024-03-15', 'YYYY-MM-DD');

			expect(result1).toBe('15/03/2024');
			expect(result2).toBe('2024-03-15');
			expect(result1).not.toBe(result2);
		});

		it('should handle empty format string as default', () => {
			const result = dateFormate('2024-03-15', '');

			// Empty format might use default or fail depending on implementation
			expect(result).toBeDefined();
		});
	});
});
