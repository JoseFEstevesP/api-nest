import { Order } from '@/constants/dataConstants';
import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { User } from '@/modules/security/user/entities/user.entity';
import { PaginationResult } from '@/types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Cache } from 'cache-manager';
import {
	FindAndCountOptions,
	Includeable,
	Op,
	OrderItem,
	WhereOptions,
} from 'sequelize';
import { AuditGetAllDTO } from './dto/auditGetAll.dto';
import { AuditRegisterDTO } from './dto/auditRegister.dto';
import { AuditUpdateDTO } from './dto/auditUpdate.dto';
import { Audit } from './entities/audit.entity';
import { OrderAuditProperty } from './enum/orderProperty';
import { msg } from './msg';
@Injectable()
export class AuditService {
	private readonly logger = new Logger(AuditService.name);
	private readonly lockKey = 'audit_cleanup_lock';
	private readonly lockTimeout = 60000;

	constructor(
		@InjectModel(Audit)
		private readonly auditModel: typeof Audit,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async create({ data }: { data: AuditRegisterDTO }): Promise<Audit> {
		this.logger.log(msg.log.create);

		const audit = await this.auditModel.findOne({
			where: {
				uidUser: data.uidUser,
				dataToken: data.dataToken,
			},
		});

		if (audit) {
			this.logger.error(msg.error.service.create);
			throwHttpExceptionUnique(msg.error.service.create);
		}

		this.logger.log(msg.log.createSuccess);
		return await this.auditModel.create(data);
	}

	async findOne(where: WhereOptions<Audit>) {
		this.logger.log(msg.log.controller.getOne);

		return await this.auditModel.findOne({ where });
	}

	async findAll({
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

	async remove(where: WhereOptions<Audit>, dataLog: string) {
		const audit = await this.auditModel.findOne({ where });

		if (!audit) {
			this.logger.error(`${dataLog} - ${msg.log.findOne}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		try {
			await audit.destroy();

			this.logger.log(`${dataLog} - ${msg.log.remove}`);

			return { msg: msg.msg.remove };
		} catch (err) {
			if (err) {
				this.logger.error(`${dataLog} - ${msg.log.relationError}`);
				throwHttpExceptionUnique(msg.log.relationError);
			}
		}
	}

	async update({ data }: { data: AuditUpdateDTO }) {
		const { uid, refreshToken } = data;
		const audit = await this.auditModel.findOne({
			where: { uid },
		});

		if (!audit) {
			this.logger.error(msg.log.findOne);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		await audit.update({ refreshToken });

		this.logger.log(msg.log.updateSuccess);

		return { msg: msg.msg.update };
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

	private async acquireLock(): Promise<boolean> {
		const result = await this.cacheManager.set(
			this.lockKey,
			true,
			this.lockTimeout,
		);
		return result === true;
	}

	private async releaseLock(): Promise<void> {
		try {
			await this.cacheManager.del(this.lockKey);
		} catch (error) {
			this.logger.error('system - Error al liberar el lock de Redis:', error);
		}
	}

	private async removeOldAudits() {
		const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
		try {
			const result = await this.auditModel.destroy({
				where: {
					createdAt: { [Op.lte]: twentyFourHoursAgo },
				},
			});
			this.logger.log(
				`system - Tarea programada: Eliminados ${result} registros de auditoría antiguos.`,
			);
		} catch (error) {
			this.logger.error(
				'system - Error al eliminar registros de auditoría antiguos:',
				error,
			);
		} finally {
			await this.releaseLock();
		}
	}

	@Cron('0 0 * * *')
	async cleanUpOldAuditsScheduled() {
		this.logger.log(
			'system - Intentando adquirir el lock para limpiar auditorías...',
		);
		if (await this.acquireLock()) {
			this.logger.log(
				'system - Lock adquirido, ejecutando la limpieza de auditorías...',
			);
			await this.removeOldAudits();
			this.logger.log(
				'system - Limpieza de auditorías completada, liberando el lock.',
			);
		} else {
			this.logger.log(
				'system - No se pudo adquirir el lock, otra instancia probablemente está ejecutando la tarea.',
			);
		}
	}
}
