import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

export const createTestingModule = async (
	metadata: any,
): Promise<TestingModule> => {
	return Test.createTestingModule(metadata).compile();
};

export const mockConfigService = {
	get: vi.fn((key: string) => {
		const config = {
			JWT_SECRET: 'test-secret',
			DATABASE_HOST: 'localhost',
			DATABASE_PORT: 5432,
			DATABASE_NAME: 'test_db',
			DATABASE_USER: 'test',
			DATABASE_PASSWORD: 'test',
			REDIS_URL: 'redis://localhost:6379',
		};
		return config[key];
	}),
};

export const mockJwtService = {
	sign: vi.fn().mockReturnValue('test-token'),
	verify: vi.fn().mockReturnValue({ sub: 1, email: 'test@test.com' }),
};

export const mockCacheManager = {
	get: vi.fn(),
	set: vi.fn(),
	del: vi.fn(),
	reset: vi.fn(),
	mget: vi.fn(),
	ttl: vi.fn(),
	mset: vi.fn(),
	mdel: vi.fn(),
	keys: vi.fn(),
	store: {},
	wrap: vi.fn(),
} as any;

export const mockLoggerService = {
	log: vi.fn(),
	error: vi.fn(),
	warn: vi.fn(),
	debug: vi.fn(),
	verbose: vi.fn(),
};

export const createMockRequest = (overrides = {}) => ({
	user: { id: 1, email: 'test@test.com' },
	headers: { authorization: 'Bearer test-token' },
	body: {},
	params: {},
	query: {},
	...overrides,
});

export const createMockResponse = () => {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		send: vi.fn().mockReturnThis(),
		cookie: vi.fn().mockReturnThis(),
		clearCookie: vi.fn().mockReturnThis(),
	};
	return res;
};
