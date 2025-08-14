import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { msg } from '../msg';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UnregisterUserUseCase {
	private readonly logger = new Logger(UnregisterUserUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

	async execute({
		uid,
		dataLog,
	}: {
		uid: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const user = await this.userRepository.findOne({ where: { uid } });

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		await this.userRepository.update(uid, { status: false });

		this.logger.log(`${dataLog} - ${msg.log.unregisterSuccess}`);

		return { msg: msg.msg.unregister };
	}
}
