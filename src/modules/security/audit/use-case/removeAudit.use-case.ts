import {
	Injectable,
	Logger,
	NotFoundException,
	ConflictException,
} from '@nestjs/common';
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
			throw new NotFoundException(msg.msg.findOne);
		}

		try {
			await this.auditRepository.delete(where);
			this.logger.log(`${dataLog} - ${msg.log.remove}`);
			return { msg: msg.msg.remove };
		} catch (err) {
			if (err) {
				this.logger.error(`${dataLog} - ${msg.log.relationError}`);
				throw new ConflictException(msg.log.relationError);
			}
		}
	}
}
