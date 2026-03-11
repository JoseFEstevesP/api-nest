import { vi } from 'vitest';

declare global {
	var jest: any;
}

// Minimal compatibility: map Jest globals to Vitest equivalents
global.jest = {
	fn: vi.fn,
	spyOn: vi.spyOn,
	mockImplementation: vi.fn,
};

export {};
