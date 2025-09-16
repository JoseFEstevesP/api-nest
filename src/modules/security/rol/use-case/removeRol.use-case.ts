import {
	ConflictException,
	forwardRef,
	Inject,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../user/repository/user.repository';
import { FindOneUserUseCase } from '../../user/use-case/findOneUser.use-case';
import { RolRepository } from '../repository/rol.repository';
import { rolMessages } from '../rol.messages';

@Injectable()
export class RemoveRolUseCase {
	private readonly logger = new Logger(RemoveRolUseCase.name);

	constructor(
		private readonly rolRepository: RolRepository,
		private readonly userRepository: UserRepository,
		@Inject(forwardRef(() => FindOneUserUseCase))
		private readonly findOneUserUseCase: FindOneUserUseCase,
	) {}

	async execute({ uid, dataLog }: { uid: string; dataLog: string }) {
		const rol = await this.rolRepository.findOne({
			where: { uid, status: true },
		});
		if (!rol) {
			this.logger.error(`${dataLog} - ${rolMessages.log.rolError}`);
			throw new NotFoundException(rolMessages.findOne);
		}

		const user = await this.userRepository.findOne({
			where: { uidRol: rol.uid },
		});

		if (user) {
			this.logger.error(`${dataLog} - ${rolMessages.log.rolError}`);
			throw new ConflictException(rolMessages.findUserExit);
		}

		await this.rolRepository.remove(uid);

		this.logger.log(`${dataLog} - ${rolMessages.log.removeSuccess}`);

		return { msg: rolMessages.delete };
	}
}
