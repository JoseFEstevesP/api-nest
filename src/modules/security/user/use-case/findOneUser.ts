import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { Includeable, WhereOptions } from 'sequelize';
import { Role } from '../../rol/entities/rol.entity';
import { TypeRol } from '../../rol/enum/rolData';
import { User } from '../entities/user.entity';
import { msg } from '../msg';
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
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		if (user.rol.typeRol !== TypeRol.admin) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.userType);
		}
		this.logger.log(`${dataLog} - ${msg.log.findOneSuccess}`);

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
