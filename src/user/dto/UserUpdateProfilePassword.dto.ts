import { Transform } from 'class-transformer';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class UserUpdateProfilePasswordDTO {
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
  readonly olPassword: string;

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
  readonly newPassword: string;
}
