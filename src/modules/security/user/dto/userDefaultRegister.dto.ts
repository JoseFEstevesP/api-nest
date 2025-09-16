import { OmitType } from '@nestjs/mapped-types';
import { UserRegisterDTO } from './userRegister.dto';

export class UserDefaultRegisterDTO extends OmitType(UserRegisterDTO, [
	'uidRol',
]) {}
