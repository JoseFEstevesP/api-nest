import { globalMsg } from '@/globalMsg';
import { Transform } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { msg } from '../msg';

export class UserNewPasswordDTO {
	@IsStrongPassword(
		{
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		},
		{ message: msg.validation.dto.password },
	)
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Transform(({ value }) => value.trim())
	@IsDefined({ message: globalMsg.dto.defined })
	readonly newPassword: string;
	@IsStrongPassword(
		{
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		},
		{ message: msg.validation.dto.password },
	)
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Transform(({ value }) => value.trim())
	@IsDefined({ message: globalMsg.dto.defined })
	readonly confirmPassword: string;
}
