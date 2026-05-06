import { registerDecorator, ValidationOptions } from 'class-validator';
import { Currency } from '../enum/currency.enum';

export function IsCurrency(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'isCurrency',
			target: object.constructor,
			propertyName: propertyName,
			options: {
				message: 'La moneda debe ser una de las siguientes: USD, VES, EUR, BTC',
				...validationOptions,
			},
			constraints: [],
			validator: {
				validate(value: unknown) {
					if (typeof value !== 'string') {
						return false;
					}
					return Object.values(Currency).includes(value as Currency);
				},
			},
		});
	};
}