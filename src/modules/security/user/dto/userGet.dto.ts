import { PickType } from '@nestjs/mapped-types';
import { UserRegisterDTO } from './userRegister.dto';

export class UserGetDTO extends PickType(UserRegisterDTO, ['uid']) {}
