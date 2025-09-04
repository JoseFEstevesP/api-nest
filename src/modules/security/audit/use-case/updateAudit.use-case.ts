import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuditUpdateDTO } from '../dto/auditUpdate.dto';
import { auditMessages } from '../audit.messages';
import { AuditRepository } from '../repository/audit.repository';

@Injectable()
export class UpdateAuditUseCase {
	private readonly logger = new Logger(UpdateAuditUseCase.name);

	constructor(private readonly auditRepository: AuditRepository) {}

	async execute({ data }: { data: AuditUpdateDTO }) {
		const { uid, refreshToken } = data;
		const audit = await this.auditRepository.findOne({
			where: { uid },
		});

		if (!audit) {
			this.logger.error(auditMessages.log.findOne);
			throw new NotFoundException(auditMessages.findOne);
		}

		await this.auditRepository.update(uid, { refreshToken });

		this.logger.log(auditMessages.log.updateSuccess);

		return { msg: auditMessages.update };
	}
}
