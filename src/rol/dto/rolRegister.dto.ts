import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';
import { DataRolOfStatus } from '../rol';

export class RolRegisterDTO implements DataRolOfStatus {
  @IsUUID('all', { message: 'EL campo UID, no es un UUID valido' })
  @IsNotEmpty({ message: 'El campo UID no puede venir vacío' })
  readonly uid: string;

  @IsString({ message: 'Este campo tiene que se de tipo cadena de texto' })
  @IsNotEmpty({ message: 'El campo Nombre no puede venir vacío' })
  @Length(3, 255, {
    message:
      'El nombre debe tener un mínimo de 3 y un máximo de 255 caracteres',
  })
  readonly name: string;

  @IsString({ message: 'Este campo tiene que se de tipo cadena de texto' })
  @IsNotEmpty({ message: 'El campo permisos no puede venir vacío' })
  readonly permissions: string;
}
