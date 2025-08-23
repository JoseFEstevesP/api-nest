import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
	FindAndCountOptions,
	FindAttributeOptions,
	Includeable,
	Op,
	WhereOptions,
} from 'sequelize';
import { AuditRegisterDTO } from '../dto/auditRegister.dto';
import { Audit } from '../entities/audit.entity';

@Injectable()
export class AuditRepository {
	constructor(
		@InjectModel(Audit)
		private readonly auditModel: typeof Audit,
	) {}

	async create(data: AuditRegisterDTO): Promise<Audit> {
		return await this.auditModel.create(data);
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
		const audit = await this.auditModel.findOne({
			where,
			...(attributes && { attributes }),
			...(include && { include }),
		});
		return audit;
	}

	async findAndCountAll(
		options: FindAndCountOptions<Audit>,
	): Promise<{ rows: Audit[]; count: number }> {
		return await this.auditModel.findAndCountAll(options);
	}

	async update(uid: string, data: Partial<Audit>): Promise<void> {
		await this.auditModel.update(data, { where: { uid } });
	}

	async delete(where: WhereOptions<Audit>): Promise<number> {
		return await this.auditModel.destroy({ where });
	}

	// Metodo adicional para eliminar registros antiguos, basado en la tarea programada
	async deleteOldRecords(thresholdDate: Date): Promise<number> {
		return await this.auditModel.destroy({
			where: {
				createdAt: {
					[Op.lt]: thresholdDate,
				},
			},
		});
	}
}
