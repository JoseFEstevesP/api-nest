import { handleDatabaseError } from '@/functions/handleDatabaseError';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
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
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
		const cacheKey = `User-findOne:${JSON.stringify({ where, attributes, include })}`;
		const cachedData = await this.cacheManager.get<User | null>(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		const user = await this.userModel.findOne({
			where,
			...(attributes && { attributes }),
			...(include && { include }),
		});

		if (user) {
			await this.cacheManager.set(cacheKey, user, 1000 * 60);
		}

		return user;
	}

	async findAll(): Promise<User[]> {
		const cacheKey = `User-findAll`;
		const cachedData = await this.cacheManager.get<User[]>(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		const users = await this.userModel.findAll();
		await this.cacheManager.set(cacheKey, users, 1000 * 60);

		return users;
	}

	async findAndCountAll(options: FindAndCountOptions<User>) {
		const cacheKey = `User-findAndCountAll:${JSON.stringify(options)}`;
		const cachedData = await this.cacheManager.get<{
			rows: User[];
			count: number;
		}>(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		const result = await this.userModel.findAndCountAll(options);
		await this.cacheManager.set(cacheKey, result, 1000 * 60);

		return result;
	}

	async update(
		uid: string,
		user: Partial<User>,
		transaction?: Transaction,
	): Promise<User | null> {
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
