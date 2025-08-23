import { Injectable, Logger } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { Audit } from '../entities/audit.entity';
import { msg } from '../msg';
import { AuditRepository } from '../repository/audit.repository';

@Injectable()
export class FindOneAuditUseCase {
	private readonly logger = new Logger(FindOneAuditUseCase.name);

	constructor(private readonly auditRepository: AuditRepository) {}

	async execute(where: WhereOptions<Audit>) {
		this.logger.log(msg.log.controller.getOne);

		return await this.auditRepository.findOne({ where });
	}
}
