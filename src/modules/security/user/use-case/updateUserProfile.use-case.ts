import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserUpdateProfileDataDTO } from '../dto/userUpdateProfileData.dto';
import { userMessages } from '../user.messages';
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
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new NotFoundException(userMessages.msg.findOne);
		}

		await this.userRepository.update(uid, data);

		this.logger.log(`${dataLog} - ${userMessages.log.profileSuccess}`);

		return { msg: userMessages.msg.update };
	}
}
