import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { msg } from '../msg';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class RecoveryVerifyPasswordUseCase {
	private readonly logger = new Logger(RecoveryVerifyPasswordUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtService,
	) {}

	async execute({
		code,
		email,
		dataLog,
	}: {
		code: string;
		email: string;
		dataLog: string;
	}): Promise<{ token: string }> {
		const user = await this.userRepository.findOne({
			where: { email, code, status: true },
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throw new NotFoundException(msg.msg.findOne);
		}

		await this.userRepository.update(user.uid, {
			code: null,
		});

		const token = await this.jwtService.signAsync({
			uid: user.uid,
		});

		this.logger.log(`${dataLog} - ${msg.log.newPasswordSuccess}`);

		return { token };
	}
}
