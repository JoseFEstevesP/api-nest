import { RemoveAuditUseCase } from '@/modules/security/audit/use-case/removeAudit.use-case';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from '@/services/logger.service';

@Injectable()
export class LogoutUseCase {
	constructor(
		private readonly removeAuditUseCase: RemoveAuditUseCase,
		private readonly logger: LoggerService,
	) {}

	async execute({
		res,
		uid,
		refreshToken,
		dataLog,
	}: {
		refreshToken?: string;
		uid?: string;
		res: Response;
		dataLog: string;
	}) {
		if (refreshToken) {
			await this.removeAuditUseCase.execute(
				{ refreshToken },
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
