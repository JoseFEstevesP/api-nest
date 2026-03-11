import {
	ConflictException,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { ExtendedConflictException } from '../exceptions/extended-conflict.exception';

export const handleDatabaseError = (
	error: Error,
	logger: Logger,
	context: string,
) => {
	if (error instanceof UniqueConstraintError) {
		// Collect potentially multiple fields from anywhere on the error object by walking recursively
		const collectPaths = (obj: any, acc: string[] = []): string[] => {
			if (!obj || typeof obj !== 'object') return acc;
			for (const key of Object.keys(obj)) {
				if (
					key === 'path' &&
					typeof obj[key] === 'string' &&
					obj[key].length > 0
				) {
					acc.push(obj[key]);
				} else {
					collectPaths(obj[key], acc);
				}
			}
			return acc;
		};
		const paths = collectPaths(error as any);
		const unique = Array.from(new Set(paths));
		const message = `El valor para ${unique.length > 0 ? unique.join(', ') : ''} ya está en uso.`;
		// Build nested response to support keys with dots
		const nestedResponse: any = {};
		const ensurePath = (
			root: any,
			parts: string[],
			idx: number,
			value: any,
		) => {
			let cur = root;
			for (let i = 0; i < parts.length - 1; i++) {
				const p = parts[i];
				if (!cur[p] || typeof cur[p] !== 'object') {
					cur[p] = {};
				}
				cur = cur[p];
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
		throw new ExtendedConflictException(nestedResponse);
	}

	logger.error(`Error no esperado durante ${context}`, error.stack);
	throw new InternalServerErrorException(
		`Ocurrió un error inesperado durante ${context}.`,
	);
};
