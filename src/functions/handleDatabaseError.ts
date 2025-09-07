import {
	ConflictException,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';

export const handleDatabaseError = (
	error: Error,
	logger: Logger,
	context: string,
) => {
	if (error instanceof UniqueConstraintError) {
		const fields = Object.keys(error.fields);
		const message = `El valor para ${fields.join(', ')} ya está en uso.`;
		throw new ConflictException(message);
	}

	logger.error(`Error no esperado durante ${context}`, error.stack);
	throw new InternalServerErrorException(
		`Ocurrió un error inesperado durante ${context}.`,
	);
};
