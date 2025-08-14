import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Audit } from '@/modules/security/audit/entities/audit.entity';
import { WhereOptions } from 'sequelize';
import { msg } from '@/modules/security/audit/msg';

@Injectable()
export class FindOneAuditUseCase {
	private readonly logger = new Logger(FindOneAuditUseCase.name);

	constructor(
		@InjectModel(Audit)
		private readonly auditModel: typeof Audit,
	) {}

	async execute(where: WhereOptions<Audit>) {
		this.logger.log(msg.log.controller.getOne);
		return await this.auditModel.findOne({ where });
	}
}
