import { throwHttpExceptionUnique } from '@/functions/throwHttpException';

import { Injectable, Logger } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { RemoveAuditUseCase } from '../../audit/use-case/remove-audit.use-case';
import { salt } from '../constants/sal';
import { msg } from '../msg';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UpdateUserProfilePasswordUseCase {
	private readonly logger = new Logger(UpdateUserProfilePasswordUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly removeAuditUseCase: RemoveAuditUseCase,
	) {}

	async execute({
		data,
		uid,
		dataLog,
	}: {
		data: { olPassword: string; newPassword: string };
		uid: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const { olPassword, newPassword } = data;
		const user = await this.userRepository.findOne({ where: { uid } });
		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		const checkPassword = await compare(olPassword, user.password);
		if (!checkPassword) {
			this.logger.error(`${dataLog} - ${msg.log.passwordError}`);
			throwHttpExceptionUnique(msg.msg.passwordError);
		}

		const hashPass = await hash(newPassword, salt);
		await this.userRepository.update(uid, { password: hashPass });
		await this.removeAuditUseCase.execute({ uidUser: uid }, dataLog); // This is an external dependency, needs to be injected

		this.logger.log(`${dataLog} - ${msg.log.profileSuccess}`);

		return { msg: msg.msg.update };
	}
}
