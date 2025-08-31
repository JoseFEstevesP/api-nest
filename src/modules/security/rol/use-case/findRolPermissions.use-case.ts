import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { rolMessages } from '../rol.messages';
import { RolRepository } from '../repository/rol.repository';


@Injectable()
export class FindRolPermissionsUseCase {
	private readonly logger = new Logger(FindRolPermissionsUseCase.name);

	constructor(private readonly rolRepository: RolRepository) {}
	// TODO: agregar que en el findOne se puede poner u array de atributos a obtener
	async execute({ uid, dataLog }: { uid: string; dataLog: string }) {
		const rol = await this.rolRepository.findOne({
			uid,
			status: true,
		});

		if (!rol) {
			this.logger.error(`${dataLog} - ${rolMessages.log.rolError}`);
			throw new NotFoundException(rolMessages.findOne);
		}

		this.logger.log(`${dataLog} - ${rolMessages.log.findOneSuccess}`);

		return rol;
	}
}
