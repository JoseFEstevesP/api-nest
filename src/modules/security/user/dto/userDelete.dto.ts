import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator';
import { userMessages } from '../user.messages';

export class UserDeleteDTO {
	@ApiProperty({
		example: 'a4e1e8b0-6f1f-4b9d-8c1a-2b3c4d5e6f7g',
		description: 'Identificador único del usuario',
	})
	@IsUUID('all', { message: userMessages.dto.uid.valid })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsDefined({ message: userMessages.dto.defined })
	readonly uid: string;
}
