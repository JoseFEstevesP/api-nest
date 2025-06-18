import { queryDTO } from '@/dto/query.dto';
import { globalMsg } from '@/globalMsg';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderAuditProperty } from '../enum/orderProperty';

export class AuditGetAllDTO extends PartialType(queryDTO) {
	@IsOptional()
	@IsEnum(OrderAuditProperty, {
		message: globalMsg.dto.enumValue,
	})
	readonly orderProperty?: OrderAuditProperty;
}
