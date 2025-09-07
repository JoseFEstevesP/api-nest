import {
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { Includeable, WhereOptions } from 'sequelize';
import { Role } from '../../rol/entities/rol.entity';
import { TypeRol } from '../../rol/enum/rolData';
import { User } from '../entities/user.entity';
import { userMessages } from '../user.messages';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class FindOneUserUseCase {
	private readonly logger = new Logger(FindOneUserUseCase.name);

	constructor(private readonly userRepository: UserRepository) {}

	async execute(where: WhereOptions<User>, dataLog?: string): Promise<User> {
		const user = await this.userRepository.findOne({
			where: { ...where, status: true },
			attributes: {
				exclude: ['password', 'status', 'createdAt', 'updatedAt'],
			},
			include: this.getIncludeOptions(),
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new NotFoundException(userMessages.msg.findOne);
		}

		if (user.rol.typeRol !== TypeRol.admin) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new ForbiddenException(userMessages.msg.userType);
		}
		this.logger.log(`${dataLog} - ${userMessages.log.findOneSuccess}`);

		return user;
	}

	private getIncludeOptions(): Includeable[] {
		return [
			{
				model: Role,
				required: true,
				attributes: ['name', 'permissions', 'typeRol'],
			},
		];
	}
}
