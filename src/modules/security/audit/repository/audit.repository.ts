import { handleDatabaseError } from '@/functions/handleDatabaseError';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
	FindAndCountOptions,
	FindAttributeOptions,
	Includeable,
	Op,
	Transaction,
	WhereOptions,
} from 'sequelize';
import { AuditRegisterDTO } from '../dto/auditRegister.dto';
import { Audit } from '../entities/audit.entity';

@Injectable()
export class AuditRepository {
	private readonly logger = new Logger(AuditRepository.name);

	constructor(
		@InjectModel(Audit)
		private readonly auditModel: typeof Audit,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
	) {}

	async create(
		data: AuditRegisterDTO,
		transaction?: Transaction,
	): Promise<Audit> {
		try {
			return await this.auditModel.create(data, {
				...(transaction && { transaction }),
			});
		} catch (error) {
			handleDatabaseError(
				error,
				this.logger,
				'la creación del registro de auditoría',
			);
		}
	}

	async findOne({
		where,
		attributes,
		include,
	}: {
		where: WhereOptions<Audit>;
		attributes?: FindAttributeOptions;
		include?: Includeable[];
	}): Promise<Audit | null> {
		const cacheKey = `Audit-findOne:${JSON.stringify({ where, attributes, include })}`;
		const cachedData = await this.cacheManager.get<Audit | null>(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		const audit = await this.auditModel.findOne({
			where,
			...(attributes && { attributes }),
			...(include && { include }),
		});

		if (audit) {
			await this.cacheManager.set(cacheKey, audit, 1000 * 60);
		}

		return audit;
	}

	async findAndCountAll(
		options: FindAndCountOptions<Audit>,
	): Promise<{ rows: Audit[]; count: number }> {
		const cacheKey = `Audit-findAndCountAll:${JSON.stringify(options)}`;
		const cachedData = await this.cacheManager.get<{
			rows: Audit[];
			count: number;
		}>(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		const result = await this.auditModel.findAndCountAll(options);
		await this.cacheManager.set(cacheKey, result, 1000 * 60);

		return result;
	}

	async update(uid: string, data: Partial<Audit>): Promise<void> {
		try {
			await this.auditModel.update(data, { where: { uid } });
		} catch (error) {
			handleDatabaseError(
				error,
				this.logger,
				'la actualización del registro de auditoría',
			);
		}
	}

	async delete(where: WhereOptions<Audit>): Promise<number> {
		try {
			return await this.auditModel.destroy({ where });
		} catch (error) {
			handleDatabaseError(
				error,
				this.logger,
				'la eliminación del registro de auditoría',
			);
		}
	}

	// Metodo adicional para eliminar registros antiguos, basado en la tarea programada
	async deleteOldRecords(thresholdDate: Date): Promise<number> {
		try {
			return await this.auditModel.destroy({
				where: {
					createdAt: {
						[Op.lt]: thresholdDate,
					},
				},
			});
		} catch (error) {
			handleDatabaseError(
				error,
				this.logger,
				'la eliminación de los registros de auditoría antiguos',
			);
		}
	}
}
