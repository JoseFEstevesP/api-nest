import { vi } from 'vitest';

declare global {
	var jest: any;
}

global.jest = {
	fn: vi.fn,
	spyOn: vi.spyOn,
	mockImplementation: vi.fn,
};

export {};
