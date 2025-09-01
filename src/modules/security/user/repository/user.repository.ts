import { handleDatabaseError } from '@/functions/handleDatabaseError';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
	FindAndCountOptions,
	FindAttributeOptions,
	Includeable,
	Transaction,
	WhereOptions,
} from 'sequelize';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
	private readonly logger = new Logger(UserRepository.name);

	constructor(
		@InjectModel(User)
		private readonly userModel: typeof User,
	) {}

	async create(user: User): Promise<User> {
		try {
			return await this.userModel.create(user);
		} catch (error) {
			handleDatabaseError(error, this.logger, 'la creación del usuario');
		}
	}

	async findOne({
		where,
		attributes,
		include,
	}: {
		where: WhereOptions<User>;
		attributes?: FindAttributeOptions;
		include?: Includeable[];
	}): Promise<User | null> {
		const user = await this.userModel.findOne({
			where,
			...(attributes && { attributes }),
			...(include && { include }),
		});
		return user;
	}

	async findAll() {
		const users = await this.userModel.findAll();
		return users;
	}

	async findAndCountAll(options: FindAndCountOptions<User>) {
		const result = await this.userModel.findAndCountAll(options);
		return result;
	}

	async update(uid: string, user: Partial<User>, transaction?: Transaction): Promise<User | null> {
		try {
			const [affectedCount] = await this.userModel.update(user, {
				where: { uid },
				...(transaction && { transaction }),
			});
			if (affectedCount === 0) {
				return null;
			}
			return this.findOne({ where: { uid } });
		} catch (error) {
			handleDatabaseError(error, this.logger, 'la actualización del usuario');
		}
	}

	async delete(uid: string): Promise<boolean> {
		try {
			const deletedCount = await this.userModel.destroy({
				where: { uid },
			});
			return deletedCount > 0;
		} catch (error) {
			handleDatabaseError(error, this.logger, 'la eliminación del usuario');
		}
	}

	async transaction<T>(callback: (t: Transaction) => Promise<T>): Promise<T> {
		return await this.userModel.sequelize.transaction(callback);
	}
}
