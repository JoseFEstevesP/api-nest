import { dataInfoJWT } from '@/functions/dataInfoJWT';
import { Request } from 'express';

describe('dataInfoJWT', () => {
	let mockRequest: Partial<Request>;

	beforeEach(() => {
		mockRequest = {
			headers: {},
			socket: {
				remoteAddress: '192.168.1.100',
			},
		} as Partial<Request>;
	});

	describe('IP detection', () => {
		it('should extract IP from x-forwarded-for header', () => {
			mockRequest.headers['x-forwarded-for'] = '203.0.113.195, 70.41.3.18, 150.172.238.178';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.ip).toBe('203.0.113.195');
		});

		it('should skip private IPs in x-forwarded-for and use first public IP', () => {
			mockRequest.headers['x-forwarded-for'] = '192.168.1.1, 10.0.0.1, 203.0.113.195, 172.16.0.1';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.ip).toBe('203.0.113.195');
		});

		it('should use first IP if all are private in x-forwarded-for', () => {
			mockRequest.headers['x-forwarded-for'] = '192.168.1.1, 10.0.0.1, 172.16.0.1';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.ip).toBe('192.168.1.1');
		});

		it('should extract IP from x-real-ip header', () => {
			mockRequest.headers['x-real-ip'] = '203.0.113.195';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.ip).toBe('203.0.113.195');
		});

		it('should prioritize x-forwarded-for over x-real-ip', () => {
			mockRequest.headers['x-forwarded-for'] = '203.0.113.195';
			mockRequest.headers['x-real-ip'] = '198.51.100.1';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.ip).toBe('203.0.113.195');
		});

		it('should use socket.remoteAddress when no proxy headers', () => {
			mockRequest.socket!.remoteAddress = '203.0.113.195';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.ip).toBe('203.0.113.195');
		});

		it('should default to "Unknown IP" when no IP source available', () => {
			mockRequest.socket = {} as any;

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.ip).toBe('Unknown IP');
		});

		it('should handle IPv6 addresses', () => {
			mockRequest.headers['x-forwarded-for'] = '::1, 2001:db8::1';

			const result = dataInfoJWT(mockRequest as Request);

			// Function skips private IPs (::1 is localhost), uses first public or first IP
			expect(result.ip).toBeDefined();
			expect(typeof result.ip).toBe('string');
		});

		it('should handle IPv4 mapped IPv6 addresses', () => {
			mockRequest.headers['x-forwarded-for'] = '::ffff:192.0.2.1';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.ip).toBe('::ffff:192.0.2.1');
		});
	});

	describe('User-Agent detection', () => {
		it('should extract user-agent from headers', () => {
			mockRequest.headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.userAgent).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
		});

		it('should default to "Unknown User-Agent" when header missing', () => {
			const result = dataInfoJWT(mockRequest as Request);

			expect(result.userAgent).toBe('Unknown User-Agent');
		});

		it('should handle empty user-agent header', () => {
			mockRequest.headers['user-agent'] = '';

			const result = dataInfoJWT(mockRequest as Request);

			// Empty string is falsy, defaults to "Unknown User-Agent"
			expect(result.userAgent).toBe('Unknown User-Agent');
		});
	});

	describe('Platform detection', () => {
		it('should extract platform from sec-ch-ua-platform header', () => {
			mockRequest.headers['sec-ch-ua-platform'] = '"Windows"';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.userPlatform).toBe('Windows');
		});

		it('should handle platform without quotes', () => {
			mockRequest.headers['sec-ch-ua-platform'] = 'macOS';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.userPlatform).toBe('macOS');
		});

		it('should handle platform with quotes', () => {
			mockRequest.headers['sec-ch-ua-platform'] = '"Android"';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.userPlatform).toBe('Android');
		});

		it('should default to "Unknown Platform" when header missing', () => {
			const result = dataInfoJWT(mockRequest as Request);

			expect(result.userPlatform).toBe('Unknown Platform');
		});

		it('should handle empty platform header', () => {
			mockRequest.headers['sec-ch-ua-platform'] = '';

			const result = dataInfoJWT(mockRequest as Request);

			// Empty string is falsy, defaults to "Unknown Platform"
			expect(result.userPlatform).toBe('Unknown Platform');
		});

		it('should handle multiple quotes in platform', () => {
			mockRequest.headers['sec-ch-ua-platform'] = '""Linux""';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.userPlatform).toBe('Linux');
		});
	});

	describe('return object structure', () => {
		it('should return object with ip, userAgent, and userPlatform', () => {
			mockRequest.headers['x-forwarded-for'] = '203.0.113.195';
			mockRequest.headers['user-agent'] = 'Test Agent';
			mockRequest.headers['sec-ch-ua-platform'] = '"Windows"';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result).toHaveProperty('ip');
			expect(result).toHaveProperty('userAgent');
			expect(result).toHaveProperty('userPlatform');
			expect(Object.keys(result).length).toBe(3);
		});

		it('should return correct types for all properties', () => {
			const result = dataInfoJWT(mockRequest as Request);

			expect(typeof result.ip).toBe('string');
			expect(typeof result.userAgent).toBe('string');
			expect(typeof result.userPlatform).toBe('string');
		});
	});

	describe('edge cases', () => {
		it('should handle malformed x-forwarded-for header', () => {
			mockRequest.headers['x-forwarded-for'] = 'malformed';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.ip).toBe('malformed');
		});

		it('should handle x-forwarded-for with spaces', () => {
			mockRequest.headers['x-forwarded-for'] = '  203.0.113.195  ,  192.168.1.1  ';

			const result = dataInfoJWT(mockRequest as Request);

			expect(result.ip).toBe('203.0.113.195');
		});

		it('should handle non-string sec-ch-ua-platform header', () => {
			mockRequest.headers['sec-ch-ua-platform'] = 123 as any;

			const result = dataInfoJWT(mockRequest as Request);

			// Should handle gracefully
			expect(result.userPlatform).toBeDefined();
		});
	});
});
