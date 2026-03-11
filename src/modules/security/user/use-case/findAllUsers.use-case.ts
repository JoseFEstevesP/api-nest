import { Order } from '@/constants/dataConstants';
import { booleanStatus } from '@/functions/booleanStatus';
import { PaginationResult } from '@/types';
import { Injectable, Logger } from '@nestjs/common';
import { FindAndCountOptions, Includeable, Op, WhereOptions } from 'sequelize';
import { Role } from '../../rol/entities/rol.entity';
import { Permission } from '../../rol/enum/permissions';
import { UserGetAllDTO } from '../dto/userGetAll.dto';
import { User } from '../entities/user.entity';
import { OrderUserProperty } from '../enum/orderProperty';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class FindAllUsersUseCase {
	private readonly logger = new Logger(FindAllUsersUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

	async execute({
		filter,
		uidUser,
		dataLog,
	}: {
		filter: UserGetAllDTO;
		uidUser: string;
		dataLog: string;
	}): Promise<PaginationResult<User>> {
		const {
			limit = 30,
			page = 1,
			orderProperty = OrderUserProperty.email,
			search,
			status: olStatus,
			order = Order.ASC,
		} = filter;

		const status = booleanStatus({ status: olStatus ?? 'true' }) ?? true;
		const parsedLimit = Number(limit);
		const parsedPage = Number(page);

		const where = this.buildWhereClause(uidUser, status, search);
		const queryOptions = this.buildQueryOptions(
			where,
			orderProperty,
			order,
			parsedLimit,
			parsedPage,
		);

		const { rows, count } =
			await this.userRepository.findAndCountAll(queryOptions);

		const pagination = this.calculatePagination(count, parsedLimit, parsedPage);

		this.logger.log(`${dataLog} - ${userMessages.log.findAllSuccess}`);
		const result = {
			...this.formateRows(rows),
			...pagination,
		};
		return result;
	}

	private formateRows(rows: User[]) {
		const format = rows.filter(
			user => !user.rol.permissions.includes(Permission.super),
		);
		return {
			rows: format,
			count: format.length,
		};
	}

	private buildWhereClause(
		uidUser: string,
		status: boolean,
		search?: string,
	): WhereOptions {
		const where: WhereOptions = {
			status,
			uid: { [Op.ne]: uidUser },
		} as WhereOptions;

		if (search) {
			(where as Record<string, unknown>)['$or'] =
				this.getSearchConditions(search);
		}

		return where;
	}

	private getSearchConditions(search: string): WhereOptions[] {
		const searchableFields = ['names', 'surnames', 'ci', 'email'];

		return searchableFields.map(field => ({
			[field]: { [Op.iLike]: `%${search}%` },
		}));
	}

	private buildQueryOptions(
		where: WhereOptions,
		orderProperty: OrderUserProperty,
		order: Order,
		limit: number,
		page: number,
	): FindAndCountOptions<User> {
		return {
			where,
			include: this.getIncludeOptions(),
			attributes: {
				exclude: this.getExcludedAttributes(),
			},
			limit,
			offset: (page - 1) * limit,
			order: [[orderProperty, order]],
		};
	}

	private getIncludeOptions(): Includeable[] {
		return [
			{
				model: Role,
				required: true,
				attributes: ['name', 'permissions', 'typeRol'],
			},
		];
	}

	private getExcludedAttributes(): string[] {
		return [
			'password',
			'status',
			'createdAt',
			'updatedAt',
			'code',
			'activatedAccount',
			'attemptCount',
			'dataOfAttempt',
		];
	}

	private calculatePagination(
		totalItems: number,
		limit: number,
		currentPage: number,
	) {
		const totalPages = Math.ceil(totalItems / limit);
		const adjustedPage = currentPage > totalPages ? totalPages : currentPage;

		return {
			currentPage: adjustedPage,
			nextPage: adjustedPage + 1 <= totalPages ? adjustedPage + 1 : null,
			previousPage: adjustedPage - 1 > 0 ? adjustedPage - 1 : null,
			limit,
			pages: totalPages,
		};
	}
}
