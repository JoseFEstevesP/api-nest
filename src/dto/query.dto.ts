import { Order } from '@/constants/dataConstants';
import { globalMsg } from '@/globalMsg';
import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator';

export class queryDTO {
	@IsString({ message: globalMsg.dto.stringValue })
	@IsOptional()
	readonly status?: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsOptional()
	readonly search?: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsDefined({ message: globalMsg.dto.defined })
	readonly page: string;

	@IsString({ message: globalMsg.dto.stringValue })
	@IsDefined({ message: globalMsg.dto.defined })
	readonly limit: string;

	@IsEnum(Order, { message: globalMsg.dto.enumValue })
	@IsDefined({ message: globalMsg.dto.defined })
	readonly order: Order;
}
