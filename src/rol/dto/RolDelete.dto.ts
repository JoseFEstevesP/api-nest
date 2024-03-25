import { PickType } from '@nestjs/mapped-types';
import { RolRegisterDTO } from './RolRegister.dto';

export class RolDeleteDTO extends PickType(RolRegisterDTO, ['uid']) {}
