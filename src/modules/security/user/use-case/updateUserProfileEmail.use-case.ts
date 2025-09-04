import {
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { compare } from 'bcrypt';
import { UserUpdateProfileEmailDTO } from '../dto/userUpdateProfileEmail.dto';
import { userMessages } from '../user.messages';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UpdateUserProfileEmailUseCase {
	private readonly logger = new Logger(UpdateUserProfileEmailUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

	async execute({
		data,
		uid,
		dataLog,
	}: {
		data: UserUpdateProfileEmailDTO;
		uid: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const { email, password } = data;
		const user = await this.userRepository.findOne({ where: { uid } });

		if (!user) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new NotFoundException(userMessages.msg.findOne);
		}

		const checkPassword = await compare(password, user.password);
		if (!checkPassword) {
			this.logger.error(`${dataLog} - ${userMessages.log.passwordError}`);
			throw new UnauthorizedException(userMessages.msg.passwordError);
		}

		await this.userRepository.update(uid, { email });

		this.logger.log(`${dataLog} - ${userMessages.log.profileSuccess}`);

		return { msg: userMessages.msg.update };
	}
}
