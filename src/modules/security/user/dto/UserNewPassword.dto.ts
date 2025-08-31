import { Transform } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { userMessages } from '../user.messages';

export class UserNewPasswordDTO {
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
}
