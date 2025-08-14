import { Order } from '@/constants/dataConstants';
import { PaginationResult } from '@/types';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
	FindAndCountOptions,
	Includeable,
	Op,
	OrderItem,
	WhereOptions,
} from 'sequelize';
import { User } from '../../user/entities/user.entity';
import { AuditGetAllDTO } from '../dto/auditGetAll.dto';
import { Audit } from '../entities/audit.entity';
import { OrderAuditProperty } from '../enum/orderProperty';
import { msg } from '../msg';

@Injectable()
export class FindAllAuditsUseCase {
	private readonly logger = new Logger(FindAllAuditsUseCase.name);

	constructor(
		@InjectModel(Audit)
		private readonly auditModel: typeof Audit,
	) {}

	async execute({
		filter,
		uidUser,
		dataLog,
	}: {
		filter: AuditGetAllDTO;
		uidUser: string;
		dataLog: string;
	}): Promise<PaginationResult<Audit>> {
		const {
			limit = 30,
			page = 1,
			search,
			orderProperty = OrderAuditProperty.ci,
			order = Order.ASC,
		} = filter;

		const parsedLimit = Number(limit);
		const parsedPage = Number(page);

		const where = this.buildWhereClause(uidUser, search);
		const queryOptions = this.buildQueryOptions(
			where,
			orderProperty,
			order,
			parsedLimit,
			parsedPage,
		);

		const { rows, count } = await this.auditModel.findAndCountAll(queryOptions);

		const pagination = this.calculatePagination(count, parsedLimit, parsedPage);

		this.logger.log(`${dataLog} - ${msg.log.findAllSuccess}`);
		return {
			rows,
			count,
			...pagination,
		};
	}

	private buildWhereClause(uidUser: string, search?: string): WhereOptions {
		const where: WhereOptions = {
			uid: { [Op.ne]: uidUser },
		};

		if (search) {
			where[Op.or as any] = this.getSearchConditions(search);
		}

		return where;
	}

	private getSearchConditions(search: string): WhereOptions[] {
		const searchableFields = [
			'$user.ci$',
			'$user.first_name$',
			'$user.first_surname$',
			'ip',
			'userAgent',
			'userPlatform',
		];

		return searchableFields.map(field => ({
			[field]: { [Op.iLike]: `%${search}%` },
		}));
	}

	private buildQueryOptions(
		where: WhereOptions,
		orderProperty: OrderAuditProperty,
		order: Order,
		limit: number,
		page: number,
	): FindAndCountOptions<Audit> {
		return {
			where,
			include: this.getIncludeOptions(),
			attributes: {
				exclude: this.getExcludedAttributes(),
			},
			limit,
			offset: (page - 1) * limit,
			order: this.getOrder(orderProperty, order),
		};
	}

	private getIncludeOptions(): Includeable[] {
		return [
			{
				model: User,
				required: true,
				attributes: ['ci', 'first_name', 'first_surname'],
			},
		];
	}

	private getExcludedAttributes(): string[] {
		return ['updatedAt', 'refreshToken'];
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

	private getOrder(orderProperty: OrderAuditProperty, direction: Order) {
		const orderMap: Record<OrderAuditProperty, any[]> = {
			ci: ['user', 'ci', direction],
			first_name: ['user', 'first_name', direction],
			first_surname: ['user', 'first_surname', direction],
			ip: ['ip', direction],
			userAgent: ['userAgent', direction],
			userPlatform: ['userPlatform', direction],
		};

		return [orderMap[orderProperty] as OrderItem];
	}
}
