import { Injectable, Logger } from '@nestjs/common';
import { RolRepository } from '../repository/rol.repository';

@Injectable()
export class FindAllRolsUseCase {
	private readonly logger = new Logger(FindAllRolsUseCase.name);

	constructor(private readonly rolRepository: RolRepository) {}

	async execute({ dataLog }: { dataLog: string }) {
		const rol = await this.rolRepository.findAll({
			where: { status: true },
			attributes: ['uid', 'name'],
		});
		const formatterData = rol.map(item => ({
			value: item.uid,
			label: item.name,
		}));
		this.logger.log(`${dataLog} - Exito al buscar los roles`);

		return formatterData;
	}
}
