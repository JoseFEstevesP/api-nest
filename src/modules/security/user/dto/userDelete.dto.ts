import { PickType } from '@nestjs/mapped-types';
import { UserRegisterDTO } from './userRegister.dto';

export class UserDeleteDTO extends PickType(UserRegisterDTO, ['uid']) {}
