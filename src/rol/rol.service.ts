import { Order } from '@/constants/dataConstants';
import { booleanStatus } from '@/functions/booleanStatus';
import {
	throwHttpExceptionProperties,
	throwHttpExceptionUnique,
} from '@/functions/throwHttpException';
import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { UserService } from '@/user/user.service';
import {
	forwardRef,
	HttpStatus,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
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
	}) {
		const {
			status: olStatus,
			limit,
			page,
			orderProperty = OrderRolProperty.name,
			order = Order.ASC,
			permission,
			search,
		} = filter;

		let status = olStatus ? booleanStatus({ status: olStatus }) : true;
		const li = +limit || 30;
		const pa = +page || 1;

		const { rows, count } = await this.rolModel.findAndCountAll({
			where: {
				status,
				...((search || permission) && {
					[Op.or]: [
						{
							...(permission && {
								permissions: { [Op.overlap]: permission },
							}),
						},
						{ ...(search && { name: { [Op.iLike]: `%${search}%` } }) },
					],
				}),
			},
			attributes: {
				exclude: ['status', 'createdAt', 'updatedAt'],
			},
			limit: li || 30,
			offset: (pa - 1) * li,
			order: [[orderProperty, order]],
		});

		const pages = Math.ceil(count / li);
		const totalPage = pa > pages ? pages : pa;
		const nextPage = totalPage + 1 <= pages ? totalPage + 1 : null;
		const previousPage = totalPage - 1 > 0 ? totalPage - 1 : null;

		this.logger.log(`${dataLog} - ${msg.log.findAllSuccess}`);

		return {
			rows,
			count,
			currentPage: totalPage,
			nextPage,
			previousPage,
			limit: li,
			pages,
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
