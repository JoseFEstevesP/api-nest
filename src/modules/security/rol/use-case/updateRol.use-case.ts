import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RolUpdateDTO } from '../dto/rolUpdate.dto';
import { RolRepository } from '../repository/rol.repository';
import { rolMessages } from '../rol.messages';

@Injectable()
export class UpdateRolUseCase {
	private readonly logger = new Logger(UpdateRolUseCase.name);

	constructor(private readonly rolRepository: RolRepository) {}

	async execute({
		uid,
		data,
		dataLog,
	}: {
		uid: string;
		data: RolUpdateDTO;
		dataLog: string;
	}) {
		const rol = await this.rolRepository.findOne({ where: { uid } });
		if (!rol) {
			this.logger.error(`${dataLog} - ${rolMessages.log.rolError}`);
			throw new NotFoundException(rolMessages.findOne);
		}

		await rol.update({
			...data,
			...(data.status !== undefined && { status: !data.status }),
		});

		this.logger.log(`${dataLog} - ${rolMessages.log.updateSuccess}`);

		return { msg: rolMessages.update };
	}
}
