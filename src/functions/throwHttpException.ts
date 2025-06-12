import { ErrorsAll } from '@/types';
import { HttpException, HttpStatus } from '@nestjs/common';
import { objectError } from './objectError';

export const throwHttpExceptionUnique = (
	msg: string,
	name: string = 'all',
	status: HttpStatus = HttpStatus.CONFLICT,
) => {
	throw new HttpException(
		objectError({
			name,
			msg,
		}),
		status,
	);
};

export const throwHttpExceptionProperties = (
	error: ErrorsAll,
	status: HttpStatus,
) => {
	throw new HttpException(error, status);
};
