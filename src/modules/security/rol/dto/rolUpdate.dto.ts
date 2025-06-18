import { globalMsg } from '@/globalMsg';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { RolRegisterDTO } from './rolRegister.dto';

export class RolUpdateDTO extends RolRegisterDTO {
	@IsBoolean({ message: globalMsg.dto.status })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsOptional()
	readonly status: boolean;
}
