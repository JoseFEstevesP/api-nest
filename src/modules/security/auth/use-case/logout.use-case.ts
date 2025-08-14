import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { AuditService } from '@/modules/security/audit/audit.service';
import { FindOneUserUseCase } from '@/modules/security/user/use-case/findOneUser';
import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { msg } from '../msg';

@Injectable()
export class LogoutUseCase {
	private readonly logger = new Logger(LogoutUseCase.name);
	constructor(
		private readonly findOneUserUseCase: FindOneUserUseCase,
		private readonly auditService: AuditService,
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

		await this.auditService.remove({ uidUser: user.uid }, dataLog);

		res
			.clearCookie('accessToken')
			.clearCookie('refreshToken')
			.json({ msg: msg.msg.logout });
	}
}
