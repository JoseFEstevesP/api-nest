import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserUpdateDTO } from '../dto/userUpdate.dto';
import { msg } from '../msg';
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
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throw new NotFoundException(msg.msg.findOne);
		}

		await this.userRepository.update(uid, {
			...updatedData,
			...(updatedData.status !== undefined && { status: !updatedData.status }),
		});

		this.logger.log(`${dataLog} - ${msg.log.updateSuccess}`);

		return { msg: msg.msg.update };
	}
}
