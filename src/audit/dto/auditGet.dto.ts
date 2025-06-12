import { PickType } from '@nestjs/mapped-types';
import { AuditRegisterDTO } from './auditRegister.dto';

export class AuditGetDTO extends PickType(AuditRegisterDTO, ['uid']) {}
