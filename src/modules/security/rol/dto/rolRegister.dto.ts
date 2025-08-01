import { globalMsg } from '@/globalMsg';
import {
	ArrayNotEmpty,
	IsArray,
	IsDefined,
	IsEnum,
	IsNotEmpty,
	IsString,
	IsUUID,
	Length,
} from 'class-validator';
import { Permission } from '../enum/permissions';
import { TypeRol } from '../enum/rolData';
import { msg } from '../msg';

export class RolRegisterDTO {
	@IsUUID('all', { message: globalMsg.dto.uid.valid })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsDefined({ message: globalMsg.dto.defined })
	readonly uid: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Length(3, 255, {
		message: globalMsg.dto.lengthValue,
	})
	@IsDefined({ message: globalMsg.dto.defined })
	readonly name: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Length(3, 255, {
		message: globalMsg.dto.lengthValue,
	})
	@IsDefined({ message: globalMsg.dto.defined })
	readonly description: string;

	@IsArray({ message: globalMsg.dto.arrayValue })
	@ArrayNotEmpty({ message: msg.dto.permission })
	@IsEnum(Permission, { each: true, message: globalMsg.dto.stringValue })
	@IsDefined({ message: globalMsg.dto.defined })
	readonly permissions: Permission[];

	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: msg.dto.permission })
	@IsDefined({ message: globalMsg.dto.defined })
	readonly typeRol: TypeRol;
}
