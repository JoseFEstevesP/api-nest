import { EmailService } from '@/services/email.service';
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { msg } from '../msg';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class RecoveryPasswordUseCase {
	private readonly logger = new Logger(RecoveryPasswordUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly emailService: EmailService,
	) {}

	async execute({
		email,
		dataLog,
	}: {
		email: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const user = await this.userRepository.findOne({
			where: { email, status: true },
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throw new NotFoundException(msg.msg.findOne);
		}

		if (!user.activatedAccount) {
			this.logger.error(`${dataLog} - ${msg.log.userErrorActiveAccount}`);
			throw new BadRequestException(msg.msg.findOne);
		}

		const generateCode = () => Math.floor(Math.random() * 9000000) + 1000000;
		const code = generateCode().toString();

		await this.userRepository.update(user.uid, { code });

		this.emailService.recoveryPassword({
			code,
			email,
		});

		this.logger.log(`${dataLog} - ${msg.log.recoveryPasswordSuccess}`);

		return { msg: msg.msg.recoveryPassword };
	}
}
