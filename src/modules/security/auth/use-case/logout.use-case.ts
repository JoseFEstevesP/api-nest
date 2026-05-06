import { RemoveAuditUseCase } from '@/modules/security/audit/use-case/removeAudit.use-case';
import { LoggerService } from '@/services/logger.service';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class LogoutUseCase {
	constructor(
		private readonly removeAuditUseCase: RemoveAuditUseCase,
		private readonly logger: LoggerService,
	) {}

	async execute({
		res,
		uid,
		dataLog,
	}: {
		uid?: string;
		res: Response;
		dataLog: string;
	}) {
		if (uid) {
			await this.removeAuditUseCase.execute(
				{ uidUser: uid },
				dataLog,
			);
		}

		res.clearCookie('accessToken').clearCookie('refreshToken');

		this.logger.info('Usuario cerró sesión exitosamente', {
			type: 'auth_logout',
			userId: uid,
			status: 'success',
		});

		this.logger.logMetric('auth.logout.exitoso', 1);
	}
}
