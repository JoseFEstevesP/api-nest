import { OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsDefined,
	IsNotEmpty,
	IsOptional,
	IsUUID,
} from 'class-validator';
import { userMessages } from '../user.messages';
import { UserRegisterDTO } from './userRegister.dto';

export class UserUpdateDTO extends OmitType(UserRegisterDTO, [
	'password',
	'confirmPassword',
]) {
	@ApiProperty({
		example: 'a4e1e8b0-6f1f-4b9d-8c1a-2b3c4d5e6f7g',
		description: 'Identificador único del usuario',
	})
	@IsUUID('all', { message: userMessages.dto.uid.valid })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsDefined({ message: userMessages.dto.defined })
	readonly uid: string;

	@ApiProperty({
		example: true,
		description: 'Estado del usuario',
	})
	@IsBoolean({ message: userMessages.dto.status })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsOptional()
	readonly status?: boolean;
}
