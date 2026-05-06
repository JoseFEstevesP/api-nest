import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { Injectable, Logger } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { RolRegisterDTO } from '../dto/rolRegister.dto';
import { Role } from '../entities/rol.entity';
import { RolRepository } from '../repository/rol.repository';
import { rolMessages } from '../rol.messages';

@Injectable()
export class CreateRolUseCase {
	private readonly logger = new Logger(CreateRolUseCase.name);

	constructor(private readonly rolRepository: RolRepository) {}

	async execute({ data, dataLog }: { data: RolRegisterDTO; dataLog: string }) {
		const { name } = data;
		const whereClause: WhereOptions<Role> = { name };
		const existingRol = await this.rolRepository.findOne({
			where: whereClause,
		});

		validatePropertyData({
			property: { name } as {
				name: string;
				status: boolean;
			},
			data: (existingRol as unknown as Record<string, unknown>) ?? undefined,
			msg: rolMessages,
		});

		await this.rolRepository.create(data as Role);

		this.logger.log(`${dataLog} - ${rolMessages.log.createSuccess}`);

		return { msg: rolMessages.register };
	}
}
