import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { UserUpdateProfileDataDTO } from '../dto/UserUpdateProfileData.dto';
import { msg } from '../msg';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UpdateUserProfileUseCase {
	private readonly logger = new Logger(UpdateUserProfileUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

	async execute({
		data,
		uid,
		dataLog,
	}: {
		data: UserUpdateProfileDataDTO;
		uid: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const user = await this.userRepository.findOne({ where: { uid } });

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		await this.userRepository.update(uid, data);

		this.logger.log(`${dataLog} - ${msg.log.profileSuccess}`);

		return { msg: msg.msg.update };
	}
}
