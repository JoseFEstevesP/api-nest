import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
	FindAndCountOptions,
	FindAttributeOptions,
	Includeable,
	WhereOptions,
} from 'sequelize';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
	constructor(
		@InjectModel(User)
		private readonly userModel: typeof User,
	) {}

	async save(user: User): Promise<User> {
		const createdUser = await this.userModel.create(user);
		return createdUser;
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

	async update(uid: string, user: Partial<User>): Promise<User | null> {
		const [affectedCount] = await this.userModel.update(user, {
			where: { uid },
		});
		if (affectedCount === 0) {
			return null;
		}
		return this.findOne({ where: { uid } });
	}

	async delete(uid: string): Promise<boolean> {
		const deletedCount = await this.userModel.destroy({
			where: { uid },
		});
		return deletedCount > 0;
	}
}
