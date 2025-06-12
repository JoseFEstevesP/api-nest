import { ErrorsAll } from '@/types';
import { objectError } from '../objectError';
import { CheckValidationErrorsProps } from './interface';

export const checkValidationErrors = <T extends { status: boolean }>({
	data,
	msg,
	name,
}: CheckValidationErrorsProps<T>): ErrorsAll => {
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

	return data.status ? possibleErrors['status'] : possibleErrors['default'];
};
