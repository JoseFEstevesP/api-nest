import { vi } from 'vitest';

export const mockSequelize = {
	authenticate: vi.fn().mockResolvedValue(undefined),
	close: vi.fn().mockResolvedValue(undefined),
	sync: vi.fn().mockResolvedValue(undefined),
	transaction: vi
		.fn()
		.mockImplementation(callback => callback(mockTransaction)),
};

export const mockTransaction = {
	commit: vi.fn().mockResolvedValue(undefined),
	rollback: vi.fn().mockResolvedValue(undefined),
};

export const createMockRepository = () => ({
	findAll: vi.fn().mockResolvedValue([]),
	findOne: vi.fn().mockResolvedValue(null),
	findByPk: vi.fn().mockResolvedValue(null),
	create: vi.fn().mockResolvedValue({}),
	update: vi.fn().mockResolvedValue([1]),
	destroy: vi.fn().mockResolvedValue(1),
	count: vi.fn().mockResolvedValue(0),
	findAndCountAll: vi.fn().mockResolvedValue({ rows: [], count: 0 }),
});

export const mockUser = {
	id: 1,
	email: 'test@test.com',
	name: 'Test User',
	password: 'hashed-password',
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};

export const mockRole = {
	id: 1,
	name: 'admin',
	permissions: ['read', 'write'],
	createdAt: new Date(),
	updatedAt: new Date(),
};
