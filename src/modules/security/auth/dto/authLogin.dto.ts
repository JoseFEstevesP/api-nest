import { UserRegisterDTO } from '@/modules/security/user/dto/userRegister.dto';
import { PickType } from '@nestjs/mapped-types';

export class AuthLoginDTO extends PickType(UserRegisterDTO, [
	'email',
	'password',
]) {}
