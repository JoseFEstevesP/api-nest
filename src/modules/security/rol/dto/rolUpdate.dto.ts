import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { RolRegisterDTO } from './rolRegister.dto';
import { rolMessages } from '../rol.messages';

export class RolUpdateDTO extends RolRegisterDTO {
	@IsBoolean({ message: rolMessages.validation.dto.status })
	@IsNotEmpty({ message: rolMessages.validation.dto.empty })
	@IsOptional()
	readonly status: boolean;
}
