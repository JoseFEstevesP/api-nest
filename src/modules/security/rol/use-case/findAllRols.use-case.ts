import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '@/services/cache.service';
import { rolMessages } from '../rol.messages';
import { RolRepository } from '../repository/rol.repository';

@Injectable()
export class FindAllRolsUseCase {
	private readonly logger = new Logger(FindAllRolsUseCase.name);
	private readonly CACHE_TTL = 3600000;

	constructor(
		private readonly rolRepository: RolRepository,
		private readonly cacheService: CacheService,
	) {}

	async execute({ dataLog }: { dataLog: string }) {
		const cacheKey = this.cacheService.buildRoleListKey();

		const cached =
			await this.cacheService.get<{ value: string; label: string }[]>(cacheKey);
		if (cached) {
			this.logger.debug(`Returning cached roles: ${cacheKey}`);
			return cached;
		}

		const rol = await this.rolRepository.findAll({
			where: { status: true },
			attributes: ['uid', 'name'],
		});

		const formatterData = rol.map(item => ({
			value: item.uid,
			label: item.name,
		}));

		await this.cacheService.set(cacheKey, formatterData, this.CACHE_TTL);
		this.logger.log(`${dataLog} - ${rolMessages.log.findAllSuccess}`);

		return formatterData;
	}
}
