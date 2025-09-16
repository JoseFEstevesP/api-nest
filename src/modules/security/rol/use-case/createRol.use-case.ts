import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { Injectable, Logger } from '@nestjs/common';
import { Op, WhereOptions } from 'sequelize';
import { RolRegisterDTO } from '../dto/rolRegister.dto';
import { Role } from '../entities/rol.entity';
import { TypeRol } from '../enum/rolData';
import { RolRepository } from '../repository/rol.repository';
import { rolMessages } from '../rol.messages';

@Injectable()
export class CreateRolUseCase {
	private readonly logger = new Logger(CreateRolUseCase.name);

	constructor(private readonly rolRepository: RolRepository) {}

	async execute({ data, dataLog }: { data: RolRegisterDTO; dataLog: string }) {
		const { name, typeRol } = data;
		const whereClause: WhereOptions<Role> = {
			[Op.or]: [{ name }, { typeRol: TypeRol.user }],
		};
		const existingPatient = await this.rolRepository.findOne({
			where: whereClause,
		});

		validatePropertyData({
			property: { name, typeRol },
			data: existingPatient,
			msg: rolMessages,
		});

		await this.rolRepository.create(data as Role);

		this.logger.log(`${dataLog} - ${rolMessages.log.createSuccess}`);

		return { msg: rolMessages.register };
	}
}
