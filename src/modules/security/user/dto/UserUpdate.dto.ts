import { globalMsg } from '@/globalMsg';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRegisterDTO } from './userRegister.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UserUpdateDTO extends OmitType(UserRegisterDTO, ['password']) {
	@IsBoolean({ message: globalMsg.dto.status })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@IsOptional()
	readonly status: boolean;
}
