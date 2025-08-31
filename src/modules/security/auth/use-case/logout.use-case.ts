import { RemoveAuditUseCase } from '@/modules/security/audit/use-case/removeAudit.use-case';
import { FindOneUserUseCase } from '@/modules/security/user/use-case/findOneUser.use-case';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
		uid,
		res,
		dataLog,
	}: {
		uid: string;
		res: Response;
		dataLog: string;
	}) {
		const user = await this.findOneUserUseCase.execute({ uid });

		if (!user) {
			this.logger.error(authMessages.log.userError);
			throw new NotFoundException(authMessages.msg.findOne);
		}

		await this.removeAuditUseCase.execute({ uidUser: user.uid }, dataLog);

		res
			.clearCookie('accessToken')
			.clearCookie('refreshToken')
			.json({ msg: authMessages.msg.logout });
	}
}
