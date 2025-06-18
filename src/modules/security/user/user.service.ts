import { EnvironmentVariables } from '@/config/env.config';
import { Order } from '@/constants/dataConstants';
import { booleanStatus } from '@/functions/booleanStatus';
import {
	throwHttpExceptionProperties,
	throwHttpExceptionUnique,
} from '@/functions/throwHttpException';
import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { AuditService } from '@/modules/security/audit/audit.service';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { Permission } from '@/modules/security/rol/enum/permissions';
import { TypeRol } from '@/modules/security/rol/enum/rolData';
import { RolService } from '@/modules/security/rol/rol.service';
import { EmailService } from '@/services/email.service';
import { PaginationResult } from '@/types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
	forwardRef,
	HttpStatus,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { compare, hash } from 'bcrypt';
import { Cache } from 'cache-manager';
import { FindAndCountOptions, Includeable, Op, WhereOptions } from 'sequelize';
import { salt } from './constants/sal';
import { UserActivateCountDTO } from './dto/UserActivateCount.dto';
import { UserDefaultRegisterDTO } from './dto/userDefaultRegister.dto';
import { UserGetAllDTO } from './dto/userGetAll.dto';
import { UserRegisterDTO } from './dto/userRegister.dto';
import { UserUpdateDTO } from './dto/UserUpdate.dto';
import { UserUpdateProfileDataDTO } from './dto/UserUpdateProfileData.dto';
import { UserUpdateProfileEmailDTO } from './dto/UserUpdateProfileEmail.dto';
import { User } from './entities/user.entity';
import { OrderUserProperty } from './enum/data';
import { checkValidationErrorsUser } from './functions/checkValidationErrorsUser';
import { msg } from './msg';

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);
	private readonly userModel: typeof User;

	constructor(
		@InjectModel(User) userModel: typeof User,
		@Inject(forwardRef(() => RolService))
		private readonly rolService: RolService,
		private readonly emailService: EmailService,
		private readonly jwtService: JwtService,
		private readonly auditService: AuditService,
		private configService: ConfigService<EnvironmentVariables>,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
	) {
		this.userModel = userModel;
	}
	async create({ data }: { data: UserDefaultRegisterDTO }) {
		const formattedCI = this.formatCI(data.ci);
		const { uid, phone, email, password } = data;
		const whereClause = {
			[Op.or]: [{ uid }, { ci: formattedCI }, { phone }, { email }],
		};
		const existingPatient = await this.userModel.findOne({
			where: whereClause,
		});

		const errors = validatePropertyData({
			property: { uid, ci: formattedCI, phone, email },
			data: existingPatient,
			msg: msg,
			checkErrors: checkValidationErrorsUser,
		});

		if (errors) {
			this.logger.error(`system ${msg.log.create}`);
			throwHttpExceptionProperties(errors, HttpStatus.CONFLICT);
		}

		const code = `${formattedCI}${this.generateCode()}`;

		if (process.env.NODE_ENV !== 'development') {
			this.logger.log(`system - ${msg.log.emailActivated}`);
			this.emailService.activatedAccount({ code, email });
		}

		const hashPass = await hash(password, salt);

		const { uid: uidRol } = await this.rolService.findOne({
			typeRol: this.configService.get<string>('DEFAULT_ROL_FROM_USER'),
		});

		await this.userModel.create({
			...data,
			ci: formattedCI,
			code: null,
			activatedAccount: true,
			password: hashPass,
			uidRol,
		});

		this.logger.log(`${formattedCI} ${msg.log.createSuccess}`);

		return { msg: msg.msg.registerDefault };
	}

	private formatCI(ci: string): string {
		return ci.replace(/\D/g, '');
	}

	async createProtect({
		data,
		dataLog,
	}: {
		data: UserRegisterDTO;
		dataLog: string;
	}) {
		const { uid, ci, phone, email, password } = data;
		const whereClause = { [Op.or]: [{ uid }, { ci }, { phone }, { email }] };
		const existingPatient = await this.userModel.findOne({
			where: whereClause,
		});

		const errors = validatePropertyData({
			property: { uid, ci, phone, email },
			data: existingPatient,
			msg: msg,
			checkErrors: checkValidationErrorsUser,
		});

		if (errors) {
			this.logger.error(`${dataLog} ${msg.log.errorValidator}`);
			throwHttpExceptionProperties(errors, HttpStatus.CONFLICT);
		}

		const hashPass = await hash(password, salt);

		await this.userModel.create({
			...data,
			password: hashPass,
			activatedAccount: true,
			code: null,
		});

		this.logger.log(`${dataLog} ${msg.log.createSuccess}`);

		return { msg: msg.msg.registerAdmin };
	}

	async profile({
		uid,
		status = true,
		dataLog,
	}: {
		uid: string;
		status?: boolean;
		dataLog: string;
	}) {
		const user = await this.userModel.findOne({
			where: { uid, status },
			include: this.getIncludeOptions(),
			attributes: [
				'v_e',
				'ci',
				'first_name',
				'middle_name',
				'first_surname',
				'last_surname',
				'sex',
				'phone',
				'email',
			],
		});
		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		this.logger.log(`${dataLog} - ${msg.log.profileSuccess}`);

		return user;
	}

	async findOne(where: WhereOptions<User>, dataLog: string) {
		const user = await this.userModel.findOne({
			where: { ...where, status: true },
			include: this.getIncludeOptions(),
			attributes: {
				exclude: ['password', 'status', 'createdAt', 'updatedAt'],
			},
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		if (user.rol.typeRol !== TypeRol.admin) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.userType);
		}
		this.logger.log(`${dataLog} - ${msg.log.findOneSuccess}`);

		return user;
	}

	async findAll({
		filter,
		uidUser,
		dataLog,
	}: {
		filter: UserGetAllDTO;
		uidUser: string;
		dataLog: string;
	}): Promise<PaginationResult<User>> {
		const cacheKey = `User-findAll:${JSON.stringify(filter)}`;
		const dataCache =
			await this.cacheManager.get<PaginationResult<User>>(cacheKey);
		if (dataCache) {
			return dataCache;
		}
		const {
			limit = 30,
			page = 1,
			search,
			status: olStatus,
			orderProperty = OrderUserProperty.ci,
			order = Order.ASC,
		} = filter;

		const status = olStatus ? booleanStatus({ status: olStatus }) : true;
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

		const { rows, count } = await this.userModel.findAndCountAll(queryOptions);

		const pagination = this.calculatePagination(count, parsedLimit, parsedPage);

		this.logger.log(`${dataLog} - ${msg.log.findAllSuccess}`);
		const result = {
			...this.formateRows(rows),
			...pagination,
		};
		await this.cacheManager.set(cacheKey, result, 1000 * 60);
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
		};

		if (search) {
			where[Op.or as any] = this.getSearchConditions(search);
		}

		return where;
	}

	private getSearchConditions(search: string): WhereOptions[] {
		const searchableFields = [
			'first_name',
			'middle_name',
			'first_surname',
			'last_surname',
			'ci',
			'email',
		];

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

	async update({ data, dataLog }: { data: UserUpdateDTO; dataLog: string }) {
		const { uid, ...updatedData } = data;
		const user = await this.userModel.findOne({
			where: { uid },
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		await user.update({
			...updatedData,
			...(updatedData.status !== undefined && { status: !updatedData.status }),
		});

		this.logger.log(`${dataLog} - ${msg.log.updateSuccess}`);

		return { msg: msg.msg.update };
	}

	async updateProfile({
		data,
		uid,
		dataLog,
	}: {
		data: UserUpdateProfileDataDTO;
		uid: string;
		dataLog: string;
	}) {
		const user = await this.userModel.findOne({ where: { uid } });

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		await user.update(data);

		this.logger.log(`${dataLog} - ${msg.log.profileSuccess}`);

		return { msg: msg.msg.update };
	}

	async updateProfileEmail({
		data,
		uid,
		dataLog,
	}: {
		data: UserUpdateProfileEmailDTO;
		uid: string;
		dataLog: string;
	}) {
		const { email, password } = data;
		const user = await this.userModel.findOne({ where: { uid } });

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		const checkPassword = await compare(password, user.password);
		if (!checkPassword) {
			this.logger.error(`${dataLog} - ${msg.log.passwordError}`);
			throwHttpExceptionUnique(msg.msg.passwordError);
		}

		await user.update({ email });

		this.logger.log(`${dataLog} - ${msg.log.profileSuccess}`);

		return { msg: msg.msg.update };
	}

	async updateProfilePassword({
		data,
		uid,
		dataLog,
	}: {
		data: { olPassword: string; newPassword: string };
		uid: string;
		dataLog: string;
	}) {
		const { olPassword, newPassword } = data;
		const user = await this.userModel.findOne({ where: { uid } });
		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		const checkPassword = await compare(olPassword, user.password);
		if (!checkPassword) {
			this.logger.error(`${dataLog} - ${msg.log.passwordError}`);
			throwHttpExceptionUnique(msg.msg.passwordError);
		}

		const hashPass = await hash(newPassword, salt);
		await user.update({ password: hashPass });
		await this.auditService.remove({ uidUser: uid }, dataLog);

		this.logger.log(`${dataLog} - ${msg.log.profileSuccess}`);

		return { msg: msg.msg.update };
	}

	async unregister({ uid, dataLog }: { uid: string; dataLog: string }) {
		const user = await this.userModel.findOne({ where: { uid } });

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		await user.update({ status: false });

		this.logger.log(`${dataLog} - ${msg.log.unregisterSuccess}`);

		return { msg: msg.msg.unregister };
	}

	async remove({ uid, dataLog }: { uid: string; dataLog: string }) {
		const user = await this.userModel.findOne({ where: { uid, status: true } });

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		try {
			await user.destroy();

			this.logger.log(`${dataLog} - ${msg.log.unregisterSuccess}`);

			return { msg: msg.msg.unregister };
		} catch (err) {
			if (err) {
				this.logger.error(`${dataLog} - ${msg.log.relationError}`);
				throwHttpExceptionUnique(msg.log.relationError);
			}
		}
	}

	async recoveryPassword({
		email,
		dataLog,
	}: {
		email: string;
		dataLog: string;
	}) {
		const user = await this.userModel.findOne({
			where: { email, status: true },
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		if (!user.activatedAccount) {
			this.logger.error(`${dataLog} - ${msg.log.userErrorActiveAccount}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		const code = this.generateCode().toString();

		await user.update({ code });

		this.emailService.recoveryPassword({
			code,
			email,
		});

		this.logger.log(`${dataLog} - ${msg.log.recoveryPasswordSuccess}`);

		return { msg: msg.msg.recoveryPassword };
	}

	async recoveryVerifyPassword({
		code,
		email,
		dataLog,
	}: {
		code: string;
		email: string;
		dataLog: string;
	}) {
		const user = await this.userModel.findOne({
			where: { email, code: code, status: true },
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		await user.update({
			code: null,
		});

		const token = await this.jwtService.signAsync({
			uid: user.uid,
		});

		this.logger.log(`${dataLog} - ${msg.log.newPasswordSuccess}`);

		return { token };
	}

	async newPassword({
		newPassword,
		confirmPassword,
		uidUser,
		dataLog,
	}: {
		newPassword: string;
		confirmPassword: string;
		uidUser: string;
		dataLog: string;
	}) {
		const user = await this.userModel.findOne({
			where: { uid: uidUser, code: null, status: true },
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		if (newPassword !== confirmPassword) {
			this.logger.error(`${dataLog} - ${msg.log.userErrorNewPassword}`);
			throwHttpExceptionUnique(msg.msg.newPassword);
		}

		const hashPass = await hash(newPassword, salt);

		await user.update({
			password: hashPass,
		});

		this.logger.log(`${dataLog} - ${msg.log.recoveryVerifyPasswordSuccess}`);

		return { msg: msg.msg.newPasswordChanged };
	}

	async activatedAccount({ code }: UserActivateCountDTO) {
		const user = await this.userModel.findOne({
			where: { code, status: true },
		});

		if (!user) {
			this.logger.error(`system - ${msg.log.userError}`);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		await user.update({
			code: null,
			activatedAccount: true,
		});

		this.logger.log(
			`${user.ci} - ${user.first_surname} ${user.first_name} - ${msg.log.activatedAccountSuccess}`,
		);

		return { msg: msg.msg.activationAccount };
	}

	private generateCode() {
		return Math.floor(Math.random() * 9000000) + 1000000;
	}

	async findUserForAuth(ci: string) {
		return this.userModel.findOne({
			where: { ci },
			include: [
				{
					model: Role,
					attributes: ['typeRol', 'permissions', 'name'],
				},
			],
		});
	}

	async findUserById(uid: string) {
		return this.userModel.findOne({ where: { uid } });
	}

	async validateAttempt({
		user,
		maxAttempt = 4,
	}: {
		user: User;
		maxAttempt?: number;
	}) {
		if (user?.attemptCount < maxAttempt) {
			await user?.update({
				attemptCount:
					user?.attemptCount >= maxAttempt
						? maxAttempt
						: user?.attemptCount + 1,
			});
		}

		if (user?.attemptCount >= maxAttempt) {
			this.logger.error(msg.log.attempt);
			await user?.update({
				attemptCount: maxAttempt,
				status: false,
			});
			throwHttpExceptionUnique(msg.msg.attempt);
		}
	}
}
