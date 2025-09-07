import { PickType } from '@nestjs/mapped-types';
import { AuditRegisterDTO } from './auditRegister.dto';

export class AuditDeleteDTO extends PickType(AuditRegisterDTO, ['uid']) {}
