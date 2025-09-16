import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FindAttributeOptions, Includeable } from 'sequelize';
import { Role } from '../../rol/entities/rol.entity';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class GetUserProfileUseCase {
	private readonly logger = new Logger(GetUserProfileUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

	async execute({
		uid,
		status = true,
		dataLog,
	}: {
		uid: string;
		status?: boolean;
		dataLog: string;
	}): Promise<User> {
		const attributes: FindAttributeOptions = [
			'names',
			'surnames',
			'phone',
			'email',
		];

		const includeOptions: Includeable[] = [
			{
				model: Role,
				required: true,
				attributes: ['name', 'permissions', 'typeRol'],
			},
		];

		const user = await this.userRepository.findOne({
			where: { uid, status },
			attributes,
			include: includeOptions,
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new NotFoundException(userMessages.msg.findOne);
		}

		this.logger.log(`${dataLog} - ${userMessages.log.profileSuccess}`);

		return user;
	}
}
