import { globalMsg } from '@/globalMsg';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';
import { msg } from '../msg';

export class UserUpdateProfilePasswordDTO {
	@IsStrongPassword(
		{
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		},
		{
			message: msg.validation.dto.password,
		},
	)
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Transform(({ value }) => value.trim())
	readonly olPassword: string;

	@IsStrongPassword(
		{
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		},
		{
			message: msg.validation.dto.password,
		},
	)
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Transform(({ value }) => value.trim())
	readonly newPassword: string;
}
