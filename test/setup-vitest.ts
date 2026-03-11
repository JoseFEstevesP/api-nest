import { vi } from 'vitest';

(global as any).jest = {
	fn: vi.fn,
	spyOn: vi.spyOn,
	mock: vi.mock,
	mockImplementation: vi.fn,
	clearAllMocks: vi.clearAllMocks,
	resetAllMocks: vi.resetAllMocks,
	requireActual: vi.fn(),
};

export {};
