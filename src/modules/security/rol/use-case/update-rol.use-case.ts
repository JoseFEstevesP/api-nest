import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { Injectable, Logger } from '@nestjs/common';
import { RolUpdateDTO } from '../dto/rolUpdate.dto';
import { msg } from '../msg';
import { RolRepository } from '../repository/rol.repository';

@Injectable()
export class UpdateRolUseCase {
	private readonly logger = new Logger(UpdateRolUseCase.name);

	constructor(private readonly rolRepository: RolRepository) {}

	async execute({ data, dataLog }: { data: RolUpdateDTO; dataLog: string }) {
		const { uid, ...updatedData } = data;
		const rol = await this.rolRepository.findOne({ uid });
		if (!rol) {
			this.logger.error(`${dataLog} - ${msg.log.rolError}`);
			throwHttpExceptionUnique(msg.findOne);
		}

		await rol.update({
			...updatedData,
			...(updatedData.status !== undefined && { status: !updatedData.status }),
		});

		this.logger.log(`${dataLog} - ${msg.log.updateSuccess}`);

		return { msg: msg.update };
	}
}
