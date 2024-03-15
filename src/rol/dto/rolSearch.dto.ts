import { IsString } from 'class-validator';
import { RolGetAllDTO } from './rolGetAll.dto';

export class RolSearchDTO extends RolGetAllDTO {
  @IsString({ message: 'La búsqueda debe ser de tipo string' })
  readonly search: string;
}
