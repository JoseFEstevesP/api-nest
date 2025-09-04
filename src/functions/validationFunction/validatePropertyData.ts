import { checkValidationErrors } from './checkValidationErrors';
import { ValidatePropertyDataProps } from './interface';

export const validatePropertyData = <T extends { status: boolean }>({
	// eslint-disable-line
	property,
	data,
	msg,
	checkErrors,
}: ValidatePropertyDataProps<T>): void => {
	for (const item of Object.keys(property)) {
		if (data && data[item] === property[item]) {
			const validationFn = checkErrors || checkValidationErrors;
			validationFn({
				data,
				msg,
				name: item,
			});
		}
	}
};
