import { Injectable, Logger } from '@nestjs/common';
import { Op } from 'sequelize';
import { AuditRepository } from '@/modules/security/audit/repository/audit.repository';

@Injectable()
export class CheckSessionUseCase {
	private readonly logger = new Logger(CheckSessionUseCase.name);

	constructor(private readonly auditRepository: AuditRepository) {}

	async execute({ refreshToken }: { refreshToken?: string }): Promise<{ isAuthenticated: boolean }> {
		if (!refreshToken) {
			this.logger.debug('CheckSession: No refreshToken provided');
			return { isAuthenticated: false };
		}

		const audit = await this.auditRepository.findOne({
			where: {
				refreshToken: {
					[Op.eq]: refreshToken,
				},
			},
		});

		if (!audit) {
			this.logger.debug('CheckSession: No active session found');
			return { isAuthenticated: false };
		}

		this.logger.debug('CheckSession: Active session found', {
			uidUser: audit.uidUser,
		});

		return { isAuthenticated: true };
	}
}