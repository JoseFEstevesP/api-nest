import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Audit } from '@/modules/security/audit/entities/audit.entity';
import { WhereOptions } from 'sequelize';
import { msg } from '@/modules/security/audit/msg';

@Injectable()
export class RemoveAuditUseCase {
	private readonly logger = new Logger(RemoveAuditUseCase.name);

	constructor(
		@InjectModel(Audit)
		private readonly auditModel: typeof Audit,
	) {}

	async execute(where: WhereOptions<Audit>, dataLog: string) {
		const audit = await this.auditModel.findOne({ where });

		if (!audit) {
			this.logger.error(`${dataLog} - ${msg.log.findOne}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		try {
			await audit.destroy();
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
