import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { RolRegisterDTO } from './rolRegister.dto';
import { rolMessages } from '../rol.messages';
import { ApiProperty } from '@nestjs/swagger';

export class RolUpdateDTO extends RolRegisterDTO {
	@ApiProperty({
		example: true,
		description: 'Estado del rol',
	})
	@IsBoolean({ message: rolMessages.validation.dto.status })
	@IsNotEmpty({ message: rolMessages.validation.dto.empty })
	@IsOptional()
	readonly status: boolean;
}
