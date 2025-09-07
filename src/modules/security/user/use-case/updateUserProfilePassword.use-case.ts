import {
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { RemoveAuditUseCase } from '../../audit/use-case/removeAudit.use-case';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class UpdateUserProfilePasswordUseCase {
	private readonly logger = new Logger(UpdateUserProfilePasswordUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly removeAuditUseCase: RemoveAuditUseCase,
		private readonly configService: ConfigService,
	) {}

	async execute({
		data,
		uid,
		dataLog,
	}: {
		data: { olPassword: string; newPassword: string };
		uid: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const { olPassword, newPassword } = data;
		const user = await this.userRepository.findOne({ where: { uid } });
		if (!user) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new NotFoundException(userMessages.msg.findOne);
		}

		if (!user) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new NotFoundException(userMessages.msg.findOne);
		}

		const checkPassword = await compare(olPassword, user.password);
		if (!checkPassword) {
			this.logger.error(`${dataLog} - ${userMessages.log.passwordError}`);
			throw new UnauthorizedException(userMessages.msg.passwordError);
		}

		const hashPass = await hash(
			newPassword,
			this.configService.get<number>('SALT_ROUNDS'),
		);
		await this.userRepository.update(uid, { password: hashPass });
		await this.removeAuditUseCase.execute({ uidUser: uid }, dataLog); // This is an external dependency, needs to be injected

		this.logger.log(`${dataLog} - ${userMessages.log.profileSuccess}`);

		return { msg: userMessages.msg.update };
	}
}
