import { CheckValidationErrorsProps } from '@/functions/validationFunction/interface';

export interface CheckValidationErrorsUserProps<T>
	extends CheckValidationErrorsProps<T> {
	msg: MsgStructureUser;
}

export interface MsgStructureUser {
	validation: {
		disability: string;
		default: string;
		activatedAccount: string;
	};
	login: {
		status: string;
	};
}
