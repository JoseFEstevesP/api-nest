import { booleanStatus } from '@/functions/booleanStatus';

describe('booleanStatus', () => {
	describe('when status is "true"', () => {
		it('should return true for lowercase "true"', () => {
			const result = booleanStatus({ status: 'true' });

			expect(result).toBe(true);
		});

		it('should return true for exact string "true"', () => {
			const result = booleanStatus({ status: 'true' });

			expect(result).toBe(true);
			expect(typeof result).toBe('boolean');
		});
	});

	describe('when status is "false"', () => {
		it('should return false for lowercase "false"', () => {
			const result = booleanStatus({ status: 'false' });

			expect(result).toBe(false);
		});

		it('should return false for exact string "false"', () => {
			const result = booleanStatus({ status: 'false' });

			expect(result).toBe(false);
			expect(typeof result).toBe('boolean');
		});
	});

	describe('when status is other value', () => {
		it('should return undefined for empty string', () => {
			const result = booleanStatus({ status: '' });

			expect(result).toBeUndefined();
		});

		it('should return undefined for "TRUE" (uppercase)', () => {
			const result = booleanStatus({ status: 'TRUE' });

			expect(result).toBeUndefined();
		});

		it('should return undefined for "FALSE" (uppercase)', () => {
			const result = booleanStatus({ status: 'FALSE' });

			expect(result).toBeUndefined();
		});

		it('should return undefined for "1"', () => {
			const result = booleanStatus({ status: '1' });

			expect(result).toBeUndefined();
		});

		it('should return undefined for "0"', () => {
			const result = booleanStatus({ status: '0' });

			expect(result).toBeUndefined();
		});

		it('should return undefined for "yes"', () => {
			const result = booleanStatus({ status: 'yes' });

			expect(result).toBeUndefined();
		});

		it('should return undefined for "no"', () => {
			const result = booleanStatus({ status: 'no' });

			expect(result).toBeUndefined();
		});

		it('should return undefined for random string', () => {
			const result = booleanStatus({ status: 'random' });

			expect(result).toBeUndefined();
		});

		it('should return undefined for string with spaces', () => {
			const result = booleanStatus({ status: ' true ' });

			expect(result).toBeUndefined();
		});
	});

	describe('edge cases', () => {
		it('should handle null status', () => {
			const result = booleanStatus({ status: null as any });

			expect(result).toBeUndefined();
		});

		it('should handle undefined status', () => {
			const result = booleanStatus({ status: undefined as any });

			expect(result).toBeUndefined();
		});

		it('should handle number 1 as status', () => {
			const result = booleanStatus({ status: 1 as any });

			expect(result).toBeUndefined();
		});

		it('should handle number 0 as status', () => {
			const result = booleanStatus({ status: 0 as any });

			expect(result).toBeUndefined();
		});

		it('should handle boolean true as status', () => {
			const result = booleanStatus({ status: true as any });

			expect(result).toBeUndefined();
		});

		it('should handle boolean false as status', () => {
			const result = booleanStatus({ status: false as any });

			expect(result).toBeUndefined();
		});

		it('should handle object as status', () => {
			const result = booleanStatus({ status: {} as any });

			expect(result).toBeUndefined();
		});

		it('should handle array as status', () => {
			const result = booleanStatus({ status: [] as any });

			expect(result).toBeUndefined();
		});
	});

	describe('return type', () => {
		it('should return boolean | undefined only', () => {
			const trueResult = booleanStatus({ status: 'true' });
			const falseResult = booleanStatus({ status: 'false' });
			const undefinedResult = booleanStatus({ status: 'other' });

			expect(typeof trueResult).toBe('boolean');
			expect(typeof falseResult).toBe('boolean');
			expect(undefinedResult).toBeUndefined();
		});
	});
});
