import { regexPhone } from '@/constants/dataConstants';
import { ApiExtraModels } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsDefined,
	IsEmail,
	IsNotEmpty,
	IsString,
	IsStrongPassword,
	IsUUID,
	Length,
	Matches,
	ValidationOptions,
	ValidationArguments,
	registerDecorator,
} from 'class-validator';
import { userMessages } from '../user.messages';

export function Match(property: string, validationOptions?: ValidationOptions) {
	return (object: object, propertyName: string) => {
		registerDecorator({
			name: 'Match',
			target: object.constructor,
			propertyName: propertyName,
			constraints: [property],
			options: validationOptions,
			validator: {
				validate(value: unknown, args: ValidationArguments) {
					const [relatedPropertyName] = args.constraints;
					const relatedValue = (args.object as Record<string, unknown>)[
						relatedPropertyName
					];
					return value === relatedValue;
				},
				defaultMessage(args: ValidationArguments) {
					const [relatedPropertyName] = args.constraints;
					return `${propertyName} must match ${relatedPropertyName}`;
				},
			},
		});
	};
}

@ApiExtraModels()
export class UserDefaultRegisterDTO {
	@IsUUID('all', { message: userMessages.dto.uid.valid })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsDefined({ message: userMessages.dto.defined })
	readonly uid: string;

	@IsString({ message: userMessages.dto.stringValue })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@Length(3, 255, { message: userMessages.dto.lengthValue })
	@IsDefined({ message: userMessages.dto.defined })
	@Transform(({ value }) => value.trim())
	readonly names: string;

	@IsString({ message: userMessages.dto.stringValue })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@Length(3, 255, { message: userMessages.dto.lengthValue })
	@IsDefined({ message: userMessages.dto.defined })
	@Transform(({ value }) => value.trim())
	readonly surnames: string;

	@IsEmail({}, { message: userMessages.validation.dto.email })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsDefined({ message: userMessages.dto.defined })
	@Transform(({ value }) => value.trim())
	readonly email: string;

	@IsString({ message: userMessages.dto.stringValue })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsDefined({ message: userMessages.dto.defined })
	@Transform(({ value }) => value.trim())
	@Matches(regexPhone, {
		message: userMessages.validation.dto.phone,
	})
	readonly phone: string;

	@IsStrongPassword(
		{
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		},
		{ message: userMessages.validation.dto.password },
	)
	@IsNotEmpty({ message: userMessages.dto.empty })
	@Transform(({ value }) => value.trim())
	@IsDefined({ message: userMessages.dto.defined })
	readonly password: string;

	@IsString({ message: userMessages.dto.stringValue })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsDefined({ message: userMessages.dto.defined })
	@Match('password', { message: userMessages.validation.dto.passwordMatch })
	readonly confirmPassword: string;
}
