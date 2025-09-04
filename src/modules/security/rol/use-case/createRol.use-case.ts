import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { Injectable, Logger } from '@nestjs/common';
import { Op } from 'sequelize';
import { RolRegisterDTO } from '../dto/rolRegister.dto';
import { RolRepository } from '../repository/rol.repository';
import { rolMessages } from '../rol.messages';

@Injectable()
export class CreateRolUseCase {
	private readonly logger = new Logger(CreateRolUseCase.name);

	constructor(private readonly rolRepository: RolRepository) {}

	async execute({ data, dataLog }: { data: RolRegisterDTO; dataLog: string }) {
		const { uid, name } = data;
		const whereClause = { [Op.or]: [{ uid }, { name }] };
		const existingPatient = await this.rolRepository.findOne({
			where: whereClause,
		});

		validatePropertyData({
			property: { uid, name },
			data: existingPatient,
			msg: rolMessages,
		});

		await this.rolRepository.create(data);

		this.logger.log(`${dataLog} - ${rolMessages.log.createSuccess}`);

		return { msg: rolMessages.register };
	}
}
