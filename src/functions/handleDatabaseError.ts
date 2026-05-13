import { InternalServerErrorException, Logger } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { ExtendedConflictException } from '../exceptions/extended-conflict.exception';

export const handleDatabaseError = (
	error: Error,
	logger: Logger,
	context: string,
) => {
	if (error instanceof UniqueConstraintError) {
		// Collect potentially multiple fields from anywhere on the error object by walking recursively
		const collectPaths = (obj: unknown, acc: string[] = []): string[] => {
			if (!obj || typeof obj !== 'object') return acc;
			const recordObj = obj as Record<string, unknown>;
			for (const key of Object.keys(recordObj)) {
				const value = recordObj[key];
				if (
					key === 'path' &&
					typeof value === 'string' &&
					value.length > 0
				) {
					acc.push(value);
				} else {
					collectPaths(value, acc);
				}
			}
			return acc;
		};
		const paths = collectPaths(error as unknown);
		const unique = Array.from(new Set(paths));
		const message = `El valor para ${unique.length > 0 ? unique.join(', ') : ''} ya está en uso.`;
		// Build nested response to support keys with dots
		const nestedResponse: Record<string, { message: string } | Record<string, { message: string }>> = {};
		const ensurePath = (
			root: Record<string, { message: string } | Record<string, { message: string }>>,
			parts: string[],
			idx: number,
			value: unknown,
		) => {
			let cur: Record<string, unknown> = root;
			for (let i = 0; i < parts.length - 1; i += 1) {
				const p = parts[i];
				if (!cur[p] || typeof cur[p] !== 'object') {
					cur[p] = {};
				}
				cur = cur[p] as Record<string, unknown>;
			}
			cur[parts[parts.length - 1]] = value;
		};
		unique.forEach(f => {
			if (f.includes('.')) {
				const parts = f.split('.');
				ensurePath(nestedResponse, parts, parts.length - 1, { message });
			} else {
				nestedResponse[f] = { message };
			}
		});
		throw new ExtendedConflictException(nestedResponse as Record<string, { message: string }>);
	}

	logger.error(`Error no esperado durante ${context}`, error.stack);
	throw new InternalServerErrorException(
		`Ocurrió un error inesperado durante ${context}.`,
	);
};
