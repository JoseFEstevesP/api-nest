import { queryDTO } from '@/dto/query.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderAuditProperty } from '../enum/orderProperty';
import { auditMessages } from '../audit.messages';

export class AuditGetAllDTO extends PartialType(queryDTO) {
	@IsOptional()
	@IsEnum(OrderAuditProperty, {
		message: auditMessages.validation.dto.enumValue,
	})
	readonly orderProperty?: OrderAuditProperty;
}
