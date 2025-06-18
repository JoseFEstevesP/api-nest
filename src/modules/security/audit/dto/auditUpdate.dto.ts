// auditUpdate.dto.ts
import { globalMsg } from '@/globalMsg';
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { msg } from '../msg';
import { AuditRegisterDTO } from './auditRegister.dto';

export class AuditUpdateDTO extends PartialType(AuditRegisterDTO) {
	@IsBoolean({ message: msg.dto.status })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsOptional()
	readonly status?: boolean;
}
