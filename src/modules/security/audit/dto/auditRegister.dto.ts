import {
	IsArray,
	IsDefined,
	IsNotEmpty,
	IsString,
	IsUUID,
} from 'class-validator';
import { auditMessages } from '../audit.messages';

export class AuditRegisterDTO {
	@IsUUID('all', { message: auditMessages.validation.dto.uid.valid })
	@IsNotEmpty({ message: auditMessages.validation.dto.empty })
	@IsDefined({ message: auditMessages.validation.dto.defined })
	readonly uid: string;

	@IsUUID('all', { message: auditMessages.validation.dto.uidUser })
	@IsNotEmpty({ message: auditMessages.validation.dto.empty })
	@IsDefined({ message: auditMessages.validation.dto.defined })
	readonly uidUser: string;

	@IsString({ message: auditMessages.validation.dto.refreshToken })
	@IsNotEmpty({ message: auditMessages.validation.dto.empty })
	@IsDefined({ message: auditMessages.validation.dto.defined })
	readonly refreshToken: string;

	@IsArray({ message: auditMessages.validation.dto.dataToken })
	@IsNotEmpty({ message: auditMessages.validation.dto.empty })
	@IsDefined({ message: auditMessages.validation.dto.defined })
	readonly dataToken: string[];
}
