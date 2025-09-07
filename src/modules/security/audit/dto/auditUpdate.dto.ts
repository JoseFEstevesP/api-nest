// auditUpdate.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { auditMessages } from '../audit.messages';
import { AuditRegisterDTO } from './auditRegister.dto';

export class AuditUpdateDTO extends PartialType(AuditRegisterDTO) {
	@ApiProperty({
		example: true,
		description: 'Estado de la auditoria',
	})
	@IsBoolean({ message: auditMessages.validation.dto.status })
	@IsNotEmpty({ message: auditMessages.validation.dto.empty })
	@IsOptional()
	readonly status?: boolean;
}
