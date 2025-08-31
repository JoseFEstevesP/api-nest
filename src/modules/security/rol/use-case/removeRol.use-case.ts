import {
	ConflictException,
	forwardRef,
	Inject,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { FindOneUserUseCase } from '../../user/use-case/findOneUser.use-case';
import { msg } from '../msg';
import { RolRepository } from '../repository/rol.repository';

@Injectable()
export class RemoveRolUseCase {
	private readonly logger = new Logger(RemoveRolUseCase.name);

	constructor(
		private readonly rolRepository: RolRepository,
		@Inject(forwardRef(() => FindOneUserUseCase))
		private readonly findOneUserUseCase: FindOneUserUseCase,
	) {}

	async execute({ uid, dataLog }: { uid: string; dataLog: string }) {
		const rol = await this.rolRepository.findOne({ uid, status: true });
		if (!rol) {
			this.logger.error(`${dataLog} - ${msg.log.rolError}`);
			throw new NotFoundException(msg.findOne);
		}

		const user = await this.findOneUserUseCase.execute(
			{ uidRol: rol.uid },
			dataLog,
		);
		if (user) {
			this.logger.error(`${dataLog} - ${msg.log.rolError}`);
			throw new ConflictException(msg.findUserExit);
		}

		await this.rolRepository.remove(uid);

		this.logger.log(`${dataLog} - ${msg.log.removeSuccess}`);

		return { msg: msg.delete };
	}
}
