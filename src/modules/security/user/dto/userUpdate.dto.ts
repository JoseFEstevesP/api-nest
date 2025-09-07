import { OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRegisterDTO } from './userRegister.dto';
import { userMessages } from '../user.messages';

export class UserUpdateDTO extends OmitType(UserRegisterDTO, ['password']) {
	@ApiProperty({
		example: true,
		description: 'Estado del usuario',
	})
	@IsBoolean({ message: userMessages.dto.status })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsOptional()
	readonly status?: boolean;
}
