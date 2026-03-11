import { objectError } from '../objectError';
import { CheckValidationErrorsProps } from './interface';
import { ConflictException } from '@nestjs/common';

export const checkValidationErrors = <T extends { status: boolean }>({
	data,
	msg,
	name,
}: CheckValidationErrorsProps<T>): void => {
	const possibleErrors = {
		status: objectError({
			name,
			msg: msg.validation.default,
		}),
		default: objectError({
			name,
			msg: msg.validation.disability,
		}),
	};

	if (data.status) {
		throw new ConflictException(possibleErrors.status);
	} else {
		throw new ConflictException(possibleErrors.default);
	}
};
