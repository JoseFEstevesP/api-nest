import { Order } from '@/constants/dataConstants';
import { booleanStatus } from '@/functions/booleanStatus';
import {
	throwHttpExceptionProperties,
	throwHttpExceptionUnique,
} from '@/functions/throwHttpException';
import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { UserService } from '@/modules/security/user/user.service';
import { PaginationResult } from '@/types';
import {
	forwardRef,
	HttpStatus,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cache } from 'cache-manager';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { RolGetAllDTO } from './dto/rolGetAll.dto';
import { RolRegisterDTO } from './dto/rolRegister.dto';
import { RolUpdateDTO } from './dto/rolUpdate.dto';
import { Role } from './entities/rol.entity';
import { OrderRolProperty } from './enum/orderProperty';
import { msg } from './msg';

@Injectable()
export class RolService {
	private readonly logger = new Logger(RolService.name);

	constructor(
		@InjectModel(Role) private readonly rolModel: typeof Role,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@Inject('CACHE_MANAGER') private readonly cacheManager: Cache,
	) {}

	async create({ data, dataLog }: { data: RolRegisterDTO; dataLog: string }) {
		const { uid, name } = data;
		const whereClause = { [Op.or]: [{ uid }, { name }] };
		const existingPatient = await this.rolModel.findOne({
			where: whereClause,
		});

		const errors = validatePropertyData({
			property: { uid, name },
			data: existingPatient,
			msg: msg,
		});

		if (errors) {
			this.logger.error(`${dataLog} - ${msg.log.errorValidator}`);
			throwHttpExceptionProperties(errors, HttpStatus.CONFLICT);
		}

		await this.rolModel.create(data);

		this.logger.log(`${dataLog} - ${msg.log.createSuccess}`);

		return { msg: msg.register };
	}

	async findOne(where: WhereOptions<Role>, dataLog?: string) {
		const rol = await this.rolModel.findOne({
			where: { ...where, status: true },
			attributes: {
				exclude: ['status', 'createdAt', 'updatedAt'],
			},
		});

		if (!rol) {
			this.logger.error(
				`${dataLog ? dataLog : 'system'} - ${msg.log.rolError}`,
			);
			throwHttpExceptionUnique(msg.findOne);
		}

		this.logger.log(
			`${dataLog ? dataLog : 'system'} - ${msg.log.findOneSuccess}`,
		);

		return rol;
	}

	async findPer({ uid, dataLog }: { uid: string; dataLog: string }) {
		const rol = await this.rolModel.findOne({
			where: { uid, status: true },
			attributes: ['permissions', 'name', 'typeRol'],
		});

		if (!rol) {
			this.logger.error(`${dataLog} - ${msg.log.rolError}`);
			throwHttpExceptionUnique(msg.findOne);
		}

		this.logger.log(`${dataLog} - ${msg.log.findOneSuccess}`);

		return rol;
	}

	async findAllPagination({
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

		const { rows, count } = await this.rolModel.findAndCountAll(queryOptions);

		const result = {
			rows,
			count,
			...this.calculatePagination(count, parsedLimit, parsedPage),
		};

		await this.cacheManager.set(cacheKey, result, 1000 * 60);
		this.logger.log(`${dataLog} - ${msg.log.findAllSuccess}`);

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

	async findAll({ dataLog }: { dataLog: string }) {
		const rol = await this.rolModel.findAll({
			where: {
				status: true,
			},
			attributes: ['uid', 'name'],
		});
		const formatterData = rol.map(item => ({
			value: item.uid,
			label: item.name,
		}));
		this.logger.log(`${dataLog} - ${msg.log.findAllSuccess}`);

		return formatterData;
	}

	async update({ data, dataLog }: { data: RolUpdateDTO; dataLog: string }) {
		const { uid, ...updatedData } = data;
		const rol = await this.rolModel.findOne({
			where: { uid },
		});
		if (!rol) {
			this.logger.error(`${dataLog} - ${msg.log.rolError}`);
			throwHttpExceptionUnique(msg.findOne);
		}

		await rol.update({
			...updatedData,
			...(updatedData.status !== undefined && { status: !updatedData.status }),
		});

		this.logger.log(`${dataLog} - ${msg.log.updateSuccess}`);

		return { msg: msg.update };
	}

	async remove({ uid, dataLog }: { uid: string; dataLog: string }) {
		const rol = await this.rolModel.findOne({ where: { uid, status: true } });
		if (!rol) {
			this.logger.error(`${dataLog} - ${msg.log.rolError}`);
			throwHttpExceptionUnique(msg.findOne);
		}

		const user = await this.userService.findOne({ uidRol: rol.uid }, dataLog);
		if (user) {
			this.logger.error(`${dataLog} - ${msg.log.rolError}`);
			throwHttpExceptionUnique(msg.findUserExit);
		}

		await rol.destroy();

		this.logger.log(`${dataLog} - ${msg.log.removeSuccess}`);

		return { msg: msg.delete };
	}
}
