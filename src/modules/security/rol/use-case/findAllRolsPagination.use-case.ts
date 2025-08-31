import { Order } from '@/constants/dataConstants';
import { booleanStatus } from '@/functions/booleanStatus';
import { PaginationResult } from '@/types';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { RolGetAllDTO } from '../dto/rolGetAll.dto';
import { Role } from '../entities/rol.entity';
import { OrderRolProperty } from '../enum/orderProperty';
import { rolMessages } from '../rol.messages';
import { RolRepository } from '../repository/rol.repository';

@Injectable()
export class FindAllRolsPaginationUseCase {
	private readonly logger = new Logger(FindAllRolsPaginationUseCase.name);

	constructor(
		private readonly rolRepository: RolRepository,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
	) {}

	async execute({
		filter,
		dataLog,
	}: {
		filter: RolGetAllDTO;
		dataLog: string;
	}): Promise<PaginationResult<Role>> {
		const cacheKey = `Rol-findAllPagination:${JSON.stringify(filter)}`;
		const cachedData =
			await this.cacheManager.get<PaginationResult<Role>>(cacheKey);

		if (cachedData) {
			return cachedData;
		}

		const {
			limit = 30,
			page = 1,
			search,
			status: olStatus,
			orderProperty = OrderRolProperty.name,
			order = Order.ASC,
			permission,
		} = filter;

		const status = olStatus ? booleanStatus({ status: olStatus }) : true;
		const parsedLimit = Number(limit);
		const parsedPage = Number(page);

		const where = this.buildWhereClause(status, search, permission);
		const queryOptions = this.buildQueryOptions(
			where,
			orderProperty,
			order,
			parsedLimit,
			parsedPage,
		);

		const { rows, count } =
			await this.rolRepository.findAndCountAll(queryOptions);

		const result = {
			rows,
			count,
			...this.calculatePagination(count, parsedLimit, parsedPage),
		};

		await this.cacheManager.set(cacheKey, result, 1000 * 60);
		this.logger.log(`${dataLog} - ${rolMessages.log.findAllSuccess}`);

		return result;
	}

	private buildWhereClause(
		status: boolean,
		search?: string,
		permission?: string,
	): WhereOptions<Role> {
		const where: WhereOptions<Role> = { status };

		if (search || permission) {
			where[Op.or] = [];

			if (search) {
				where[Op.or].push({ name: { [Op.iLike]: `%${search}%` } });
			}

			if (permission) {
				where[Op.or].push({ permissions: { [Op.overlap]: permission } });
			}
		}

		return where;
	}

	private buildQueryOptions(
		where: WhereOptions<Role>,
		orderProperty: OrderRolProperty,
		order: Order,
		limit: number,
		page: number,
	): FindAndCountOptions<Role> {
		return {
			where,
			attributes: {
				exclude: ['status', 'createdAt', 'updatedAt'],
			},
			limit,
			offset: (page - 1) * limit,
			order: [[orderProperty, order]],
		};
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
