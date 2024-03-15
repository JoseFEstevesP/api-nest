import { PickType } from '@nestjs/mapped-types';
import { DataUserLogin } from './../user';
import { UserRegisterDTO } from './userRegister.dto';

export class UserLoginDTO
  extends PickType(UserRegisterDTO, ['ci', 'password'])
  implements DataUserLogin {}
