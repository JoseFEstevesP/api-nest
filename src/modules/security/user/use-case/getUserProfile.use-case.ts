import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { Includeable } from 'sequelize';
import { Role } from '../../rol/entities/rol.entity';
import { User } from '../entities/user.entity';
import { msg } from '../msg';
import { UserRepository } from '../repository/user.repository';

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
		const attributes = [
			'v_e',
			'ci',
			'first_name',
			'middle_name',
			'first_surname',
			'last_surname',
			'sex',
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
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		this.logger.log(`${dataLog} - ${msg.log.profileSuccess}`);

		return user;
	}
}
