import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserUpdateDTO } from '../dto/userUpdate.dto';
import { userMessages } from '../user.messages';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UpdateUserUseCase {
	private readonly logger = new Logger(UpdateUserUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

	async execute({
		data,
		dataLog,
	}: {
		data: UserUpdateDTO;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const { uid, ...updatedData } = data;
		const user = await this.userRepository.findOne({ where: { uid } });

		if (!user) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new NotFoundException(userMessages.msg.findOne);
		}

		await this.userRepository.update(uid, {
			...updatedData,
			...(updatedData.status !== undefined && { status: !updatedData.status }),
		});

		this.logger.log(`${dataLog} - ${userMessages.log.updateSuccess}`);

		return { msg: userMessages.msg.update };
	}
}
