import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuditRegisterDTO } from '../dto/auditRegister.dto';
import { Audit } from '../entities/audit.entity';
import { msg } from '../msg';

@Injectable()
export class CreateAuditUseCase {
	private readonly logger = new Logger(CreateAuditUseCase.name);

	constructor(
		@InjectModel(Audit)
		private readonly auditModel: typeof Audit,
	) {}

	async execute({ data }: { data: AuditRegisterDTO }): Promise<Audit> {
		this.logger.log(msg.log.create);

		const audit = await this.auditModel.findOne({
			where: {
				uidUser: data.uidUser,
				dataToken: data.dataToken,
			},
		});

		if (audit) {
			this.logger.error(msg.error.service.create);
			throwHttpExceptionUnique(msg.error.service.create);
		}

		this.logger.log(msg.log.createSuccess);
		return await this.auditModel.create(data);
	}
}
