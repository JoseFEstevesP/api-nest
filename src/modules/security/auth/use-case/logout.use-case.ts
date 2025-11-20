import { RemoveAuditUseCase } from '@/modules/security/audit/use-case/removeAudit.use-case';
import { FindOneUserUseCase } from '@/modules/security/user/use-case/findOneUser.use-case';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { authMessages } from '../auth.messages';

@Injectable()
export class LogoutUseCase {
	private readonly logger = new Logger(LogoutUseCase.name);
	constructor(
		private readonly findOneUserUseCase: FindOneUserUseCase,
		private readonly removeAuditUseCase: RemoveAuditUseCase,
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
			this.logger.error(authMessages.log.refreshToken);
			throw new UnauthorizedException(authMessages.msg.refreshToken);
		}

		await this.removeAuditUseCase.execute(
			{ ...(uid && { uid }), ...(refreshToken && { refreshToken }) },
			dataLog,
		);

		res.clearCookie('accessToken').clearCookie('refreshToken');
		// Response will be handled by the controller
	}
}
