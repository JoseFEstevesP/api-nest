import { queryDTO } from '@/dto/query.dto';
import { globalMsg } from '@/globalMsg';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderRolProperty } from '../enum/orderProperty';
import { Permission } from '../enum/permissions';
import { msg } from '../msg';

export class RolGetAllDTO extends PartialType(queryDTO) {
	@IsOptional()
	@IsEnum(OrderRolProperty, {
		message: globalMsg.dto.enumValue,
	})
	readonly orderProperty?: OrderRolProperty;

	@IsOptional()
	@IsEnum(Permission, {
		message: msg.dto.permission,
	})
	readonly permission?: Permission;
}
