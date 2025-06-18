import { globalMsg } from '@/globalMsg';
import { Transform } from 'class-transformer';
import {
	IsDefined,
	IsNotEmpty,
	IsStrongPassword,
	IsUUID,
} from 'class-validator';
import { msg } from '../msg';

export class UserUpdatePasswordDTO {
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

	@IsUUID('all', { message: globalMsg.dto.uid.valid })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsDefined({ message: globalMsg.dto.defined })
	readonly uidUser: string;
}
