import {
	Injectable,
	NotFoundException,
	ConflictException,
} from '@nestjs/common';
import { LoggerService } from '@/services/logger.service';
import { userMessages } from '../user.messages';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class RemoveUserUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly logger: LoggerService,
	) {}

	async execute({
		uid,
		dataLog,
	}: {
		uid: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		this.logger.debug(`Eliminando usuario: ${uid}`, {
			type: 'user_remove',
			userId: uid,
		});

		const user = await this.userRepository.findOne({
			where: { uid, status: true },
		});

		if (!user) {
			this.logger.error(
				`${dataLog} - ${userMessages.log.userError}`,
				'RemoveUserUseCase',
				{
					type: 'user_remove',
					userId: uid,
					status: 'not_found',
				},
			);
			throw new NotFoundException(userMessages.msg.findOne);
		}

		try {
			await this.userRepository.delete(uid);

			this.logger.info(`${dataLog} - ${userMessages.log.unregisterSuccess}`, {
				type: 'user_remove',
				userId: uid,
				status: 'success',
			});

			this.logger.logMetric('usuario.eliminado', 1, { userId: uid });

			return { msg: userMessages.msg.unregister };
		} catch (err) {
			this.logger.error(
				`${dataLog} - ${userMessages.log.relationError}`,
				'RemoveUserUseCase',
				{
					type: 'user_remove',
					userId: uid,
					error: err instanceof Error ? err.message : 'Unknown error',
				},
			);
			throw new ConflictException(userMessages.log.relationError);
		}
	}
}
