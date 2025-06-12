import { ErrorsAll } from '@/types';
import { checkValidationErrors } from './checkValidationErrors';
import { ValidatePropertyDataProps } from './interface';

export const validatePropertyData = <T extends { status: boolean }>({
	property,
	data,
	msg,
	checkErrors,
}: ValidatePropertyDataProps<T>) => {
	const propertyData = Object.keys(property);

	const error = propertyData.map(item => {
		if (data && data[item] === property[item]) {
			if (checkErrors) {
				return checkErrors({
					data,
					msg,
					name: item,
				});
			}

			return checkValidationErrors({
				data,
				msg,
				name: item,
			});
		}
	});

	const resError: ErrorsAll = Object.assign(
		{},
		...error.filter(items => items !== undefined),
	);

	return Object.keys(resError).length > 0 ? resError : undefined;
};
