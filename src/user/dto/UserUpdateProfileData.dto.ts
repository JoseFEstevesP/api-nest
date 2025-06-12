import { OmitType } from '@nestjs/mapped-types';
import { UserRegisterDTO } from './userRegister.dto';

export class UserUpdateProfileDataDTO extends OmitType(UserRegisterDTO, [
	'email',
	'password',
	'uid',
	'uidRol',
]) {}
