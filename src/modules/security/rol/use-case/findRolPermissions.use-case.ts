import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { msg } from '../msg';
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
			this.logger.error(`${dataLog} - ${msg.log.rolError}`);
			throwHttpExceptionUnique(msg.findOne);
		}

		this.logger.log(`${dataLog} - ${msg.log.findOneSuccess}`);

		return rol;
	}
}
