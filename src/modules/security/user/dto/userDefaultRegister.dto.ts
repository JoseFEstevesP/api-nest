import { regexPhone } from '@/constants/dataConstants';
import { globalMsg } from '@/globalMsg';
import { ApiExtraModels } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsDefined,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsString,
	IsStrongPassword,
	IsUUID,
	Length,
	Matches,
} from 'class-validator';
import { Sex, V_E } from '../enum/data';
import { msg } from '../msg';
import { DataUserOfExtraData } from '../types';

@ApiExtraModels()
export class UserDefaultRegisterDTO implements DataUserOfExtraData {
	@IsUUID('all', { message: globalMsg.dto.uid.valid })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsDefined({ message: globalMsg.dto.defined })
	readonly uid: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsDefined({ message: globalMsg.dto.defined })
	@IsEnum(V_E, { message: globalMsg.dto.enumValue })
	readonly v_e: V_E;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Length(6, 8, { message: msg.validation.dto.ci.length })
	@IsDefined({ message: globalMsg.dto.defined })
	@Matches(/^\d+$/, { message: msg.validation.dto.ci.invalidCharacters })
	@Transform(({ value }) => value.trim())
	readonly ci: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Length(3, 255, { message: globalMsg.dto.lengthValue })
	@IsDefined({ message: globalMsg.dto.defined })
	@Transform(({ value }) => value.trim())
	readonly first_name: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Length(3, 255, { message: globalMsg.dto.lengthValue })
	@IsDefined({ message: globalMsg.dto.defined })
	@Transform(({ value }) => value.trim())
	readonly middle_name: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Length(3, 255, { message: globalMsg.dto.lengthValue })
	@IsDefined({ message: globalMsg.dto.defined })
	@Transform(({ value }) => value.trim())
	readonly first_surname: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Length(3, 255, { message: globalMsg.dto.lengthValue })
	@IsDefined({ message: globalMsg.dto.defined })
	@Transform(({ value }) => value.trim())
	readonly last_surname: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsDefined({ message: globalMsg.dto.defined })
	@IsEnum(Sex, { message: globalMsg.dto.enumValue })
	readonly sex: Sex;

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
