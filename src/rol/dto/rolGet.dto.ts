import { PickType } from '@nestjs/mapped-types';
import { RolRegisterDTO } from './rolRegister.dto';

export class RolGetDTO extends PickType(RolRegisterDTO, ['uid']) {}
