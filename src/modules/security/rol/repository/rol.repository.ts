import { handleDatabaseError } from '@/functions/handleDatabaseError';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
	FindAndCountOptions,
	FindAttributeOptions,
	WhereOptions,
} from 'sequelize';
import { RolRegisterDTO } from '../dto/rolRegister.dto';
import { Role } from '../entities/rol.entity';

@Injectable()
export class RolRepository {
	private readonly logger = new Logger(RolRepository.name);

	constructor(@InjectModel(Role) private readonly rolModel: typeof Role) {}

	async create(data: RolRegisterDTO): Promise<Role> {
		try {
			return await this.rolModel.create(data);
		} catch (error) {
			handleDatabaseError(error, this.logger, 'la creación del rol');
		}
	}

	async findOne(where: WhereOptions<Role>): Promise<Role | null> {
		return await this.rolModel.findOne({ where });
	}

	async findAndCountAll(
		options: FindAndCountOptions<Role>,
	): Promise<{ rows: Role[]; count: number }> {
		return await this.rolModel.findAndCountAll(options);
	}

	async findAll({
		where,
		attributes,
	}: {
		where: WhereOptions<Role>;
		attributes?: FindAttributeOptions;
	}): Promise<Role[]> {
		return await this.rolModel.findAll({
			where,
			...(attributes && { attributes }),
		});
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
