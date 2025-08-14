import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { msg } from '../msg';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class RemoveUserUseCase {
	private readonly logger = new Logger(RemoveUserUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

	async execute({
		uid,
		dataLog,
	}: {
		uid: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const user = await this.userRepository.findOne({
			where: { uid, status: true },
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		try {
			await this.userRepository.delete(uid);

			this.logger.log(`${dataLog} - ${msg.log.unregisterSuccess}`);

			return { msg: msg.msg.unregister };
		} catch (err) {
			if (err) {
				this.logger.error(`${dataLog} - ${msg.log.relationError}`);
				throwHttpExceptionUnique(msg.log.relationError);
			}
		}
		return { msg: msg.msg.unregister };
	}
}
