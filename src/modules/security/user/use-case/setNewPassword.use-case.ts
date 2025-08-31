import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { salt } from '../constants/sal';
import { msg } from '../msg';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class SetNewPasswordUseCase {
	private readonly logger = new Logger(SetNewPasswordUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

	async execute({
		newPassword,
		confirmPassword,
		uidUser,
		dataLog,
	}: {
		newPassword: string;
		confirmPassword: string;
		uidUser: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const user = await this.userRepository.findOne({
			where: { uid: uidUser, code: null, status: true },
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throw new NotFoundException(msg.msg.findOne);
		}

		if (newPassword !== confirmPassword) {
			this.logger.error(`${dataLog} - ${msg.log.userErrorNewPassword}`);
			throw new BadRequestException(msg.msg.newPassword);
		}

		const hashPass = await hash(newPassword, salt);

		await this.userRepository.update(uidUser, {
			password: hashPass,
		});

		this.logger.log(`${dataLog} - ${msg.log.recoveryVerifyPasswordSuccess}`);

		return { msg: msg.msg.newPasswordChanged };
	}
}
