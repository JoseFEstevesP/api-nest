import { UserRegisterDTO } from '@/user/dto/userRegister.dto';
import { PickType } from '@nestjs/mapped-types';

export class AuthLoginDTO extends PickType(UserRegisterDTO, [
	'ci',
	'password',
]) {}
