import { regexPhone } from '@/constants/dataConstants';
import { globalMsg } from '@/globalMsg';
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
} from 'class-validator';
import { msg } from '../msg';

@ApiExtraModels()
export class UserDefaultRegisterDTO {
	@IsUUID('all', { message: globalMsg.dto.uid.valid })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsDefined({ message: globalMsg.dto.defined })
	readonly uid: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Length(3, 255, { message: globalMsg.dto.lengthValue })
	@IsDefined({ message: globalMsg.dto.defined })
	@Transform(({ value }) => value.trim())
	readonly names: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Length(3, 255, { message: globalMsg.dto.lengthValue })
	@IsDefined({ message: globalMsg.dto.defined })
	@Transform(({ value }) => value.trim())
	readonly surnames: string;

	@IsEmail({}, { message: msg.validation.dto.email })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsDefined({ message: globalMsg.dto.defined })
	@Transform(({ value }) => value.trim())
	readonly email: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsDefined({ message: globalMsg.dto.defined })
	@Transform(({ value }) => value.trim())
	@Matches(regexPhone, {
		message: msg.validation.dto.phone,
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
		{ message: msg.validation.dto.password },
	)
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Transform(({ value }) => value.trim())
	@IsDefined({ message: globalMsg.dto.defined })
	readonly password: string;
}
