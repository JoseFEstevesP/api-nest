// auditUpdate.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { auditMessages } from '../audit.messages';
import { AuditRegisterDTO } from './auditRegister.dto';

export class AuditUpdateDTO extends PartialType(AuditRegisterDTO) {
	@IsBoolean({ message: auditMessages.validation.dto.status })
	@IsNotEmpty({ message: auditMessages.validation.dto.empty })
	@IsOptional()
	readonly status?: boolean;
}
