import { throwHttpExceptionProperties } from '@/functions/throwHttpException';
import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Op } from 'sequelize';
import { RolRegisterDTO } from '../dto/rolRegister.dto';
import { msg } from '../msg';
import { RolRepository } from '../repository/rol.repository';

@Injectable()
export class CreateRolUseCase {
	private readonly logger = new Logger(CreateRolUseCase.name);

	constructor(private readonly rolRepository: RolRepository) {}

	async execute({ data, dataLog }: { data: RolRegisterDTO; dataLog: string }) {
		const { uid, name } = data;
		const whereClause = { [Op.or]: [{ uid }, { name }] };
		const existingPatient = await this.rolRepository.findOne(whereClause);

		const errors = validatePropertyData({
			property: { uid, name },
			data: existingPatient,
			msg: msg,
		});

		if (errors) {
			this.logger.error(`${dataLog} - ${msg.log.errorValidator}`);
			throwHttpExceptionProperties(errors, HttpStatus.CONFLICT);
		}

		await this.rolRepository.create(data);

		this.logger.log(`${dataLog} - ${msg.log.createSuccess}`);

		return { msg: msg.register };
	}
}
