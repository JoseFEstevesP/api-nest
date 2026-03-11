import { RemoveAuditUseCase } from '@/modules/security/audit/use-case/removeAudit.use-case';
import { FindOneUserUseCase } from '@/modules/security/user/use-case/findOneUser.use-case';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from '@/services/logger.service';
import { authMessages } from '../auth.messages';

@Injectable()
export class LogoutUseCase {
	constructor(
		private readonly findOneUserUseCase: FindOneUserUseCase,
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
		if (!refreshToken) {
			this.logger.warn('Logout intentado sin refresh token', {
				type: 'auth_logout',
				userId: uid,
				status: 'failed',
			});
			throw new UnauthorizedException(authMessages.msg.refreshToken);
		}

		await this.removeAuditUseCase.execute(
			{ ...(uid && { uid }), ...(refreshToken && { refreshToken }) },
			dataLog,
		);

		res.clearCookie('accessToken').clearCookie('refreshToken');

		this.logger.info('Usuario cerró sesión exitosamente', {
			type: 'auth_logout',
			userId: uid,
			status: 'success',
		});

		this.logger.logMetric('auth.logout.exitoso', 1);
	}
}
