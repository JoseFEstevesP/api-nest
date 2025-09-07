import {
	Injectable,
	Logger,
	NotFoundException,
	ConflictException,
} from '@nestjs/common';
import { userMessages } from '../user.messages';
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
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new NotFoundException(userMessages.msg.findOne);
		}

		try {
			await this.userRepository.delete(uid);

			this.logger.log(`${dataLog} - ${userMessages.log.unregisterSuccess}`);

			return { msg: userMessages.msg.unregister };
		} catch (err) {
			if (err) {
				this.logger.error(`${dataLog} - ${userMessages.log.relationError}`);
				throw new ConflictException(userMessages.log.relationError);
			}
		}
		return { msg: userMessages.msg.unregister };
	}
}
