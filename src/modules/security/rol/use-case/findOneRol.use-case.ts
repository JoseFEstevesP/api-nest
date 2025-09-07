import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { Role } from '../entities/rol.entity';
import { RolRepository } from '../repository/rol.repository';
import { rolMessages } from '../rol.messages';

@Injectable()
export class FindOneRolUseCase {
	private readonly logger = new Logger(FindOneRolUseCase.name);

	constructor(private readonly rolRepository: RolRepository) {}

	async execute(where: WhereOptions<Role>, dataLog?: string) {
		const rol = await this.rolRepository.findOne({
			where: { ...where, status: true },
		});

		if (!rol) {
			this.logger.error(
				`${dataLog ? dataLog : 'system'} - No se encontro el rol`,
			);
			throw new NotFoundException(rolMessages.findOne);
		}

		this.logger.log(`${dataLog ? dataLog : 'system'} - Exito al buscar el rol`);

		return rol;
	}
}
