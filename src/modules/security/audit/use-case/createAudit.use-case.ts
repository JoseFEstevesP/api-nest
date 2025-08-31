import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { AuditRegisterDTO } from '../dto/auditRegister.dto';
import { Audit } from '../entities/audit.entity';
import { msg } from '../msg';
import { AuditRepository } from '../repository/audit.repository';

@Injectable()
export class CreateAuditUseCase {
	private readonly logger = new Logger(CreateAuditUseCase.name);

	constructor(private readonly auditRepository: AuditRepository) {}

	async execute({ data }: { data: AuditRegisterDTO }, t?: Transaction): Promise<Audit> {
		this.logger.log(msg.log.create);

		const audit = await this.auditRepository.findOne({
			where: {
				uidUser: data.uidUser,
				dataToken: data.dataToken,
			},
		});

		if (audit) {
			this.logger.error(msg.error.service.create);
			throw new ConflictException(msg.error.service.create);
		}

		this.logger.log(msg.log.createSuccess);
		return await this.auditRepository.create(data, t);
	}
}
