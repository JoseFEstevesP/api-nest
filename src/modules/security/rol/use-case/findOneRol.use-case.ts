import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { CacheService } from '@/services/cache.service';
import { Role } from '../entities/rol.entity';
import { RolRepository } from '../repository/rol.repository';
import { rolMessages } from '../rol.messages';

@Injectable()
export class FindOneRolUseCase {
	private readonly logger = new Logger(FindOneRolUseCase.name);
	private readonly CACHE_TTL = 3600000;

	constructor(
		private readonly rolRepository: RolRepository,
		private readonly cacheService: CacheService,
	) {}

	async execute(where: WhereOptions<Role>, dataLog?: string) {
		const uid = (where as { uid?: string }).uid;
		if (!uid) {
			return this.fetchAndCache(where, dataLog);
		}

		const cacheKey = this.cacheService.buildRoleKey(uid);
		const cached = await this.cacheService.get<Role>(cacheKey);
		if (cached) {
			this.logger.debug(`Returning cached role: ${cacheKey}`);
			return cached;
		}

		return this.fetchAndCache(where, dataLog, cacheKey);
	}

	private async fetchAndCache(
		where: WhereOptions<Role>,
		dataLog?: string,
		cacheKey?: string,
	): Promise<Role> {
		const rol = await this.rolRepository.findOne({
			where: { ...where, status: true },
			attributes: {
				exclude: ['createdAt', 'updatedAt', 'status'],
			},
		});

		if (!rol) {
			this.logger.error(
				`${dataLog ? dataLog : 'system'} - ${rolMessages.log.findOne}`,
			);
			throw new NotFoundException(rolMessages.findOne);
		}

		if (cacheKey) {
			await this.cacheService.set(cacheKey, rol, this.CACHE_TTL);
		}

		this.logger.log(
			`${dataLog ? dataLog : 'system'} - ${rolMessages.log.findOneSuccess}`,
		);

		return rol;
	}
}
