import { objectError } from '@/functions/objectError';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { Injectable, Logger } from '@nestjs/common';
import { userMessages } from '../user.messages';
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
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'uid', msg: userMessages.msg.findOne }),
			);
		}

		await this.userRepository.update(uid, { status: false });

		this.logger.log(`${dataLog} - ${userMessages.log.unregisterSuccess}`);

		return { msg: userMessages.msg.unregister };
	}
}
