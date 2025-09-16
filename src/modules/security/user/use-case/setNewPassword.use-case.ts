import {
	Injectable,
	Logger,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';
import { userMessages } from '../user.messages';
import { UserRepository } from '../repository/user.repository';
import { EnvironmentVariables } from '@/config/env.config';

@Injectable()
export class SetNewPasswordUseCase {
	private readonly logger = new Logger(SetNewPasswordUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly configService: ConfigService<EnvironmentVariables>,
	) {}

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
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new NotFoundException(userMessages.msg.findOne);
		}

		if (newPassword !== confirmPassword) {
			this.logger.error(
				`${dataLog} - ${userMessages.log.userErrorNewPassword}`,
			);
			throw new BadRequestException(userMessages.msg.newPassword);
		}

		const hashPass = await hash(
			newPassword,
			this.configService.get('SALT_ROUNDS'),
		);

		await this.userRepository.update(uidUser, {
			password: hashPass,
		});

		this.logger.log(
			`${dataLog} - ${userMessages.log.recoveryVerifyPasswordSuccess}`,
		);

		return { msg: userMessages.msg.newPasswordChanged };
	}
}
