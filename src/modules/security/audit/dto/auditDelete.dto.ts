import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator';
import { auditMessages } from '../audit.messages';

export class AuditDeleteDTO {
	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'Identificador único de la auditoria',
	})
	@IsUUID('all', { message: auditMessages.validation.dto.uid.valid })
	@IsNotEmpty({ message: auditMessages.validation.dto.empty })
	@IsDefined({ message: auditMessages.validation.dto.defined })
	readonly uid: string;
}
