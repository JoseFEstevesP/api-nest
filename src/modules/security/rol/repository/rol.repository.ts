import { handleDatabaseError } from '@/functions/handleDatabaseError';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
	FindAndCountOptions,
	FindAttributeOptions,
	Includeable,
	WhereOptions,
} from 'sequelize';
import { Role } from '../entities/rol.entity';

@Injectable()
export class RolRepository {
	private readonly logger = new Logger(RolRepository.name);

	constructor(
		@InjectModel(Role) private readonly rolModel: typeof Role,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
	) {}

	async create(data: Role): Promise<Role> {
		try {
			return await this.rolModel.create(data);
		} catch (error) {
			handleDatabaseError(error, this.logger, 'la creación del rol');
		}
	}

	async findOne({
		where,
		attributes,
		include,
	}: {
		where: WhereOptions<Role>;
		attributes?: FindAttributeOptions;
		include?: Includeable[];
	}): Promise<Role | null> {
		const cacheKey = `Rol-findOne:${JSON.stringify({ where, attributes })}`;
		const cachedData = await this.cacheManager.get<Role | null>(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		const rol = await this.rolModel.findOne({
			where,
			...(attributes && { attributes }),
			...(include && { include }),
		});

		if (rol) {
			await this.cacheManager.set(cacheKey, rol, 1000 * 60);
		}

		return rol;
	}

	async findAndCountAll(
		options: FindAndCountOptions<Role>,
	): Promise<{ rows: Role[]; count: number }> {
		const cacheKey = `Rol-findAndCountAll:${JSON.stringify(options)}`;
		const cachedData = await this.cacheManager.get<{
			rows: Role[];
			count: number;
		}>(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		const result = await this.rolModel.findAndCountAll(options);
		await this.cacheManager.set(cacheKey, result, 1000 * 60);

		return result;
	}

	async findAll({
		where,
		attributes,
	}: {
		where: WhereOptions<Role>;
		attributes?: FindAttributeOptions;
	}): Promise<Role[]> {
		const cacheKey = `Rol-findAll:${JSON.stringify({ where, attributes })}`;
		const cachedData = await this.cacheManager.get<Role[]>(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		const rols = await this.rolModel.findAll({
			where,
			...(attributes && { attributes }),
		});
		await this.cacheManager.set(cacheKey, rols, 1000 * 60);

		return rols;
	}

	async update(uid: string, data: Partial<Role>): Promise<void> {
		try {
			await this.rolModel.update(data, { where: { uid } });
		} catch (error) {
			handleDatabaseError(error, this.logger, 'la actualización del rol');
		}
	}

	async remove(uid: string): Promise<void> {
		try {
			await this.rolModel.destroy({ where: { uid } });
		} catch (error) {
			handleDatabaseError(error, this.logger, 'la eliminación del rol');
		}
	}
}
