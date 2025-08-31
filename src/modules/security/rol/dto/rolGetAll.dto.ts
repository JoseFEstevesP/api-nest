import { queryDTO } from '@/dto/query.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderRolProperty } from '../enum/orderProperty';
import { Permission } from '../enum/permissions';
import { rolMessages } from '../rol.messages';

export class RolGetAllDTO extends PartialType(queryDTO) {
	@IsOptional()
	@IsEnum(OrderRolProperty, {
		message: rolMessages.validation.dto.enumValue,
	})
	readonly orderProperty?: OrderRolProperty;

	@IsOptional()
	@IsEnum(Permission, {
		message: rolMessages.validation.dto.permission,
	})
	readonly permission?: Permission;
}
