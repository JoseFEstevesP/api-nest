import { objectError } from '@/functions/objectError';
import { CheckValidationErrorsUserProps } from './types';

export const checkValidationErrorsUser = <
	T extends { status: boolean; activatedAccount: boolean },
>({
	data,
	msg,
	name,
}: CheckValidationErrorsUserProps<T>) => {
	const possibleErrors = {
		status: objectError({
			name,
			msg: msg.validation.default,
		}),
		default: objectError({
			name,
			msg: msg.validation.disability,
		}),
		activatedAccount: objectError({
			name,
			msg: msg.validation.activatedAccount,
		}),
	};

	if (data.status === false) {
		return possibleErrors.default;
	}

	if (data.status === true) {
		return possibleErrors.status;
	}

	if (data.activatedAccount === false) {
		return possibleErrors.activatedAccount;
	}
};

export const checkValidationErrorsUserLogin = <T extends { status: boolean }>({
	data,
	msg,
	name,
}: CheckValidationErrorsUserProps<T>) => {
	const possibleErrors = {
		status: objectError({
			name,
			msg: msg.login.status,
		}),
	};

	return !data.status && possibleErrors['status'];
};
