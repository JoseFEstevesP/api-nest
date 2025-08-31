import { Transform } from 'class-transformer';
import {
	IsDefined,
	IsNotEmpty,
	IsStrongPassword,
	IsUUID,
} from 'class-validator';
import { userMessages } from '../user.messages';

export class UserUpdatePasswordDTO {
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
	readonly newPassword: string;
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
	readonly confirmPassword: string;

	@IsUUID('all', { message: userMessages.dto.uid.valid })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsDefined({ message: userMessages.dto.defined })
	readonly uidUser: string;
}
