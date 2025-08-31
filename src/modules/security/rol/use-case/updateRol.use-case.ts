import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RolUpdateDTO } from '../dto/rolUpdate.dto';
import { msg } from '../msg';
import { RolRepository } from '../repository/rol.repository';

@Injectable()
export class UpdateRolUseCase {
	private readonly logger = new Logger(UpdateRolUseCase.name);

	constructor(private readonly rolRepository: RolRepository) {}

	async execute({ uid, data, dataLog }: { uid: string; data: RolUpdateDTO; dataLog: string }) {
		const rol = await this.rolRepository.findOne({ uid });
		if (!rol) {
			this.logger.error(`${dataLog} - ${msg.log.rolError}`);
			throw new NotFoundException(msg.findOne);
		}

		await rol.update({
			...data,
			...(data.status !== undefined && { status: !data.status }),
		});

		this.logger.log(`${dataLog} - ${msg.log.updateSuccess}`);

		return { msg: msg.update };
	}
}