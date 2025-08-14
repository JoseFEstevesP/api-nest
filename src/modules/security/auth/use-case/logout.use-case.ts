import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { RemoveAuditUseCase } from '@/modules/security/audit/use-case/remove-audit.use-case';
import { FindOneUserUseCase } from '@/modules/security/user/use-case/findOneUser';
import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { msg } from '../msg';

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
			this.logger.error(msg.log.userError);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		await this.removeAuditUseCase.execute({ uidUser: user.uid }, dataLog);

		res
			.clearCookie('accessToken')
			.clearCookie('refreshToken')
			.json({ msg: msg.msg.logout });
	}
}
