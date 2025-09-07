import { Audit } from '@/modules/security/audit/entities/audit.entity';
import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { auditMessages } from '../audit.messages';
import { AuditRepository } from '../repository/audit.repository';

@Injectable()
export class RemoveAuditUseCase {
	private readonly logger = new Logger(RemoveAuditUseCase.name);

	constructor(private readonly auditRepository: AuditRepository) {}

	async execute(where: WhereOptions<Audit>, dataLog: string) {
		const audit = await this.auditRepository.findOne({ where });

		if (!audit) {
			this.logger.error(`${dataLog} - ${auditMessages.log.findOne}`);
			throw new NotFoundException(auditMessages.findOne);
		}

		try {
			await this.auditRepository.delete(where);
			this.logger.log(`${dataLog} - ${auditMessages.log.remove}`);
			return { msg: auditMessages.errorService.remove };
		} catch (err) {
			if (err) {
				this.logger.error(`${dataLog} - ${auditMessages.log.relationError}`);
				throw new ConflictException(auditMessages.log.relationError);
			}
		}
	}
}
