import { queryDTO } from '@/dto/query.dto';
import { globalMsg } from '@/globalMsg';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderUserProperty } from '../enum/data';

export class UserGetAllDTO extends PartialType(queryDTO) {
	@IsEnum(OrderUserProperty, {
		message: globalMsg.dto.enumValue,
	})
	@IsOptional()
	readonly orderProperty?: OrderUserProperty;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsOptional()
	readonly search?: string;
}
