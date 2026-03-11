import { ConflictException, Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { LoggerService } from '@/services/logger.service';
import { AuditRegisterDTO } from '../dto/auditRegister.dto';
import { Audit } from '../entities/audit.entity';
import { auditMessages } from '../audit.messages';
import { AuditRepository } from '../repository/audit.repository';

@Injectable()
export class CreateAuditUseCase {
	constructor(
		private readonly auditRepository: AuditRepository,
		private readonly logger: LoggerService,
	) {}

	async execute(
		{ data }: { data: AuditRegisterDTO },
		t?: Transaction,
	): Promise<Audit> {
		this.logger.debug('Creando registro de auditoría', {
			type: 'audit_create',
			userId: data.uidUser,
		});

		const audit = await this.auditRepository.findOne({
			where: {
				uidUser: data.uidUser,
				dataToken: data.dataToken,
			},
		});

		if (audit) {
			this.logger.warn('Auditoría ya existe', {
				type: 'audit_create',
				userId: data.uidUser,
				status: 'duplicate',
			});
			throw new ConflictException(auditMessages.errorService.create);
		}

		const created = await this.auditRepository.create(data, t);

		this.logger.info(auditMessages.log.createSuccess, {
			type: 'audit_create',
			auditId: created.uid,
			userId: data.uidUser,
		});

		return created;
	}
}
