import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  IsUUID,
  Length,
} from 'class-validator';
import { DataUserOfExtraData } from '../user';

export class UserRegisterDTO implements DataUserOfExtraData {
  @IsUUID('all', { message: 'EL campo UID, no es un UUID valido' })
  @IsNotEmpty({ message: 'El campo UID no puede venir vacío' })
  readonly uid: string;

  @IsString({ message: 'Este campo tiene que se de tipo cadena de texto' })
  @IsNotEmpty({ message: 'El campo CI no puede venir vacío' })
  @Length(7, 8, {
    message: 'La cedula se compone por un mínimo de 7 y un máximo de 8 dígitos',
  })
  readonly ci: string;

  @IsString({ message: 'Este campo tiene que se de tipo cadena de texto' })
  @IsNotEmpty({ message: 'El campo Nombre no puede venir vacío' })
  @Length(3, 255, {
    message:
      'El nombre debe tener un mínimo de 3 y un máximo de 255 caracteres',
  })
  readonly name: string;

  @IsString({ message: 'Este campo tiene que se de tipo cadena de texto' })
  @IsNotEmpty({ message: 'El campo Apellido no puede venir vacío' })
  @Length(3, 255, {
    message:
      'El apellido debe tener un mínimo de 3 y un máximo de 255 caracteres',
  })
  readonly surname: string;

  @IsEmail({}, { message: 'El correo debe ser un correo valido' })
  @IsNotEmpty({ message: 'El campo Correo no puede venir vacío' })
  readonly email: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'La contraseña se compone de un mínimo de 8 caracteres y debe de contener 1 mayúscula, 1 minúscula, 1 numero y un carácter',
    },
  )
  @IsNotEmpty({ message: 'El campo Contraseña no puede venir vacío' })
  @Transform(({ value }) => value.trim())
  readonly password: string;
}
