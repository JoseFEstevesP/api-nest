import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { RolRegisterDTO } from './rolRegister.dto';

export class RolUpdateDTO extends RolRegisterDTO {
  @IsBoolean({ message: 'Este campo tiene que se de tipo booleano' })
  @IsNotEmpty({ message: 'El campo status no puede venir vacío' })
  @IsOptional()
  readonly status: boolean;
}
