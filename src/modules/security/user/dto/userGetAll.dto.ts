import { queryDTO } from '@/dto/query.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderUserProperty } from '../enum/data';
import { userMessages } from '../user.messages';

export class UserGetAllDTO extends PartialType(queryDTO) {
	@IsEnum(OrderUserProperty, {
		message: userMessages.dto.enumValue,
	})
	@IsOptional()
	readonly orderProperty?: OrderUserProperty;

	@IsString({ message: userMessages.dto.stringValue })
	@IsOptional()
	readonly search?: string;
}
