import { globalMsg } from '@/globalMsg';
import {
	IsArray,
	IsDefined,
	IsNotEmpty,
	IsString,
	IsUUID,
} from 'class-validator';
import { msg } from './../msg';

export class AuditRegisterDTO {
	@IsUUID('all', { message: msg.dto.uid })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsDefined({ message: globalMsg.dto.defined })
	readonly uid: string;

	@IsUUID('all', { message: msg.dto.uidUser })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsDefined({ message: globalMsg.dto.defined })
	readonly uidUser: string;

	@IsString({ message: msg.dto.refreshToken })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsDefined({ message: globalMsg.dto.defined })
	readonly refreshToken: string;

	@IsArray({ message: msg.dto.dataToken })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsDefined({ message: globalMsg.dto.defined })
	readonly dataToken: string[];
}
