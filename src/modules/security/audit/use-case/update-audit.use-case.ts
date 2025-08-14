import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuditUpdateDTO } from '@/modules/security/audit/dto/auditUpdate.dto';
import { Audit } from '@/modules/security/audit/entities/audit.entity';
import { msg } from '@/modules/security/audit/msg';

@Injectable()
export class UpdateAuditUseCase {
	private readonly logger = new Logger(UpdateAuditUseCase.name);

	constructor(
		@InjectModel(Audit)
		private readonly auditModel: typeof Audit,
	) {}

	async execute({ data }: { data: AuditUpdateDTO }) {
		const { uid, refreshToken } = data;
		const audit = await this.auditModel.findOne({
			where: { uid },
		});

		if (!audit) {
			this.logger.error(msg.log.findOne);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		await audit.update({ refreshToken });

		this.logger.log(msg.log.updateSuccess);

		return { msg: msg.msg.update };
	}
}
