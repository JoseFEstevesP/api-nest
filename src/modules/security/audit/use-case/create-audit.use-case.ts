import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuditRegisterDTO } from '@/modules/security/audit/dto/auditRegister.dto';
import { Audit } from '@/modules/security/audit/entities/audit.entity';
import { msg } from '@/modules/security/audit/msg';

@Injectable()
export class CreateAuditUseCase {
	private readonly logger = new Logger(CreateAuditUseCase.name);

	constructor(
		@InjectModel(Audit)
		private readonly auditModel: typeof Audit,
	) {}

	async execute({ data }: { data: AuditRegisterDTO }): Promise<Audit> {
		console.log('🚀 -> CreateAuditUseCase -> execute -> data:', data);
		this.logger.log(msg.log.create);

		const audit = await this.auditModel.findOne({
			where: {
				uidUser: data.uidUser,
				dataToken: data.dataToken,
			},
		});
		console.log('🚀 -> CreateAuditUseCase -> execute -> audit:', audit);

		if (audit) {
			this.logger.error(msg.error.service.create);
			throwHttpExceptionUnique(msg.error.service.create);
		}

		this.logger.log(msg.log.createSuccess);
		return await this.auditModel.create(data);
	}
}
