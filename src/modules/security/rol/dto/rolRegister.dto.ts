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
import { rolMessages } from '../rol.messages';

export class RolRegisterDTO {
	@IsUUID('all', { message: rolMessages.validation.dto.uid.valid })
	@IsNotEmpty({ message: rolMessages.validation.dto.empty })
	@IsDefined({ message: rolMessages.validation.dto.defined })
	readonly uid: string;

	@IsString({ message: rolMessages.validation.dto.stringValue })
	@IsNotEmpty({ message: rolMessages.validation.dto.empty })
	@Length(3, 255, {
		message: rolMessages.validation.dto.lengthValue,
	})
	@IsDefined({ message: rolMessages.validation.dto.defined })
	readonly name: string;

	@IsString({ message: rolMessages.validation.dto.stringValue })
	@IsNotEmpty({ message: rolMessages.validation.dto.empty })
	@Length(3, 255, {
		message: rolMessages.validation.dto.lengthValue,
	})
	@IsDefined({ message: rolMessages.validation.dto.defined })
	readonly description: string;

	@IsArray({ message: rolMessages.validation.dto.arrayValue })
	@ArrayNotEmpty({ message: rolMessages.validation.dto.permission })
	@IsEnum(Permission, { each: true, message: rolMessages.validation.dto.stringValue })
	@IsDefined({ message: rolMessages.validation.dto.defined })
	readonly permissions: Permission[];

	@IsString({ message: rolMessages.validation.dto.stringValue })
	@IsNotEmpty({ message: rolMessages.validation.dto.permission })
	@IsDefined({ message: rolMessages.validation.dto.defined })
	readonly typeRol: TypeRol;
}
