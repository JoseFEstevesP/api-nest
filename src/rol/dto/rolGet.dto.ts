import { PickType } from '@nestjs/mapped-types';
import { RolRegisterDTO } from './RolRegister.dto';

export class RolGetDTO extends PickType(RolRegisterDTO, ['uid']) {}
