import { objectError } from '@/functions/objectError';
import { ConflictException } from '@nestjs/common';
import { CheckValidationErrorsUserProps } from './types';
import { userMessages } from '../user.messages';

export const checkValidationErrorsUser = <
	T extends { status: boolean; activatedAccount: boolean },
>({
	data,
	name,
}: CheckValidationErrorsUserProps<T>): void => {
	const possibleErrors = {
		status: objectError({
			name,
			msg: userMessages.validation.default,
		}),
		default: objectError({
			name,
			msg: userMessages.validation.disability,
		}),
		activatedAccount: objectError({
			name,
			msg: userMessages.validation.activatedAccount,
		}),
	};

	if (data.status === false) {
		throw new ConflictException(possibleErrors.default);
	}

	if (data.status === true) {
		throw new ConflictException(possibleErrors.status);
	}

	if (data.activatedAccount === false) {
		throw new ConflictException(possibleErrors.activatedAccount);
	}
};

export const checkValidationErrorsUserLogin = <T extends { status: boolean }>({
	data,
	name,
}: CheckValidationErrorsUserProps<T>) => {
	const possibleErrors = {
		status: objectError({
			name,
			msg: userMessages.msg.login.status,
		}),
	};

	return !data.status && possibleErrors['status'];
};
