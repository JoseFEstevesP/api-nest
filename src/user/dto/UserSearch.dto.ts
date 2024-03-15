import { IsString } from 'class-validator';
import { UserGetAllDTO } from './userGetAll.dto';

export class UserSearchDTO extends UserGetAllDTO {
  @IsString({ message: 'La búsqueda debe ser de tipo string' })
  readonly search: string;
}
