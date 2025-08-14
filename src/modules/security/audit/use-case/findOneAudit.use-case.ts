import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WhereOptions } from 'sequelize';
import { Audit } from '../entities/audit.entity';
import { msg } from '../msg';

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
