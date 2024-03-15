import { OmitType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { DataUserUpdate } from '../user';
import { UserRegisterDTO } from './userRegister.dto';

export class UserUpdateDTO
  extends OmitType(UserRegisterDTO, ['password'])
  implements DataUserUpdate
{
  @IsBoolean({ message: 'Este campo tiene que se de tipo booleano' })
  @IsNotEmpty({ message: 'El campo status no puede venir vacío' })
  @IsOptional()
  readonly status: boolean;
}
