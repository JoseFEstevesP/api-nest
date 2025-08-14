import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { Role } from '../entities/rol.entity';
import { msg } from '../msg';
import { RolRepository } from '../repository/rol.repository';

@Injectable()
export class FindOneRolUseCase {
	private readonly logger = new Logger(FindOneRolUseCase.name);

	constructor(private readonly rolRepository: RolRepository) {}

	async execute(where: WhereOptions<Role>, dataLog?: string) {
		const rol = await this.rolRepository.findOne({
			...where,
			status: true,
		});

		if (!rol) {
			this.logger.error(
				`${dataLog ? dataLog : 'system'} - No se encontro el rol`,
			);
			throwHttpExceptionUnique(msg.findOne);
		}

		this.logger.log(`${dataLog ? dataLog : 'system'} - Exito al buscar el rol`);

		return rol;
	}
}
