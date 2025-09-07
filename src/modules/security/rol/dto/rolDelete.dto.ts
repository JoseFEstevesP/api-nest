import { PickType } from '@nestjs/mapped-types';
import { RolRegisterDTO } from './rolRegister.dto';

export class RolDeleteDTO extends PickType(RolRegisterDTO, ['uid']) {}
