import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { UserActivateCountDTO } from '../dto/userActivateCount.dto';
import { msg } from '../msg';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class ActivateAccountUseCase {
	private readonly logger = new Logger(ActivateAccountUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

	async execute({ code }: UserActivateCountDTO): Promise<{ msg: string }> {
		const user = await this.userRepository.findOne({
			where: { code, status: true },
		});

		if (!user) {
			this.logger.error(`system - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		await this.userRepository.update(user.uid, {
			code: null,
			activatedAccount: true,
		});

		this.logger.log(
			`${user.first_surname} ${user.first_name} - ${msg.log.activatedAccountSuccess}`,
		);

		return { msg: msg.msg.activationAccount };
	}
}
