import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggerService } from '@/services/logger.service';
import { UserUpdateDTO } from '../dto/userUpdate.dto';
import { userMessages } from '../user.messages';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UpdateUserUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly logger: LoggerService,
	) {}

	async execute({
		data,
		dataLog,
	}: {
		data: UserUpdateDTO;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const { uid, ...updatedData } = data;

		this.logger.debug(`Actualizando usuario: ${uid}`, {
			type: 'user_update',
			userId: uid,
		});

		const user = await this.userRepository.findOne({ where: { uid } });

		if (!user) {
			this.logger.error(
				`${dataLog} - ${userMessages.log.userError}`,
				'UpdateUserUseCase',
				{
					type: 'user_update',
					userId: uid,
					status: 'not_found',
				},
			);
			throw new NotFoundException(userMessages.msg.findOne);
		}

		await this.userRepository.update(uid, {
			...updatedData,
			...(updatedData.status !== undefined && { status: !updatedData.status }),
		});

		this.logger.info(`${dataLog} - ${userMessages.log.updateSuccess}`, {
			type: 'user_update',
			userId: uid,
			status: 'success',
		});

		this.logger.logMetric('usuario.actualizado', 1, { userId: uid });

		return { msg: userMessages.msg.update };
	}
}
