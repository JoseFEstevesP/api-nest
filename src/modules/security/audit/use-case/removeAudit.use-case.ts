import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { Audit } from '@/modules/security/audit/entities/audit.entity';
import { WhereOptions } from 'sequelize';
import { msg } from '@/modules/security/audit/msg';
import { AuditRepository } from '../repository/audit.repository';

@Injectable()
export class RemoveAuditUseCase {
	private readonly logger = new Logger(RemoveAuditUseCase.name);

	constructor(private readonly auditRepository: AuditRepository) {}

	async execute(where: WhereOptions<Audit>, dataLog: string) {
		const audit = await this.auditRepository.findOne({ where });

		if (!audit) {
			this.logger.error(`${dataLog} - ${msg.log.findOne}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		try {
			// En lugar de llamar a destroy(), usamos el repositorio para eliminar
			await this.auditRepository.delete(where);
			this.logger.log(`${dataLog} - ${msg.log.remove}`);
			return { msg: msg.msg.remove };
		} catch (err) {
			if (err) {
				this.logger.error(`${dataLog} - ${msg.log.relationError}`);
				throwHttpExceptionUnique(msg.log.relationError);
			}
		}
	}
}
