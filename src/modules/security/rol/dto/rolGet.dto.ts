import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator';
import { rolMessages } from '../rol.messages';

export class RolGetDTO {
	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'Identificador único del rol',
	})
	@IsUUID('all', { message: rolMessages.validation.dto.uid.valid })
	@IsNotEmpty({ message: rolMessages.validation.dto.empty })
	@IsDefined({ message: rolMessages.validation.dto.defined })
	readonly uid: string;
}
