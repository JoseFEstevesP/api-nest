export const TEMPLATES = {
	// Archivo [moduleName].messages.ts - basado en rol.messages.ts
	messages: (
		moduleName,
		capitalizedName,
	) => `export const ${moduleName}Messages = {
  // General messages
  findOne: 'No se ha encontrado ningún ${moduleName}',
  findUserExit: 'No se puede eliminar ya que un usuario está asignado a este ${moduleName}',
  register: '${capitalizedName} registrado exitosamente',
  update: '${capitalizedName} actualizado exitosamente',
  delete: '${capitalizedName} eliminado',
  credential: 'Credenciales no válidas.',
  userError: '${capitalizedName} no encontrado.',
  relationError: 'El ${moduleName} esta relacionado con otros datos',

  // Validation messages
  validation: {
    disability: 'Este ${moduleName} ya está registrado, pero está deshabilitado',
    default: 'Este ${moduleName} ya está registrado',
    dto: {
			status: 'Este campo debe ser un booleano',
      empty: 'Este campo no puede estar vacío',
      defined: 'Este campo no está definido',
      stringValue: 'Este campo debe ser de tipo cadena de texto',
      enumValue: 'Valor no válido',
      lengthValue: 'Este campo debe tener entre 3 y 255 caracteres',
      uid: {
        valid: 'El campo UID no es un UUID válido',
        empty: 'El campo UID no puede estar vacío',
      },
    },
  },

  // Log messages
  log: {
    create: 'Creando ${moduleName}',
    createAut: 'Creando ${moduleName} automático',
    createAutProcess: 'Proceso para crear ${moduleName} automático',
    createAutVerify: 'Verificando existencia de ${moduleName} automático',
    createAutSuccess: '${capitalizedName} automático creado exitosamente',
    createSuccess: '${capitalizedName} creado exitosamente',
    errorValidator: 'Falló la validación',
    ${moduleName}Error: '${capitalizedName} no encontrado',
    findOne: 'Encontrar ${moduleName} con UID',
    findOneSuccess: '${capitalizedName} encontrado exitosamente',
    findAll: 'Encontrar o buscar ${moduleName}',
    findAllSuccess: '${capitalizedName} encontrado o buscado exitosamente',
    update: 'Actualizar ${moduleName}',
    updateSuccess: '${capitalizedName} actualizado exitosamente',
    remove: 'Eliminar ${moduleName}',
    removeSuccess: '${capitalizedName} eliminado exitosamente',
    controller: {
      create: 'Registrando nuevo ${moduleName} en el controlador con datos',
      login: 'Controlador de inicio de sesión de ${moduleName} con datos',
      findOne: 'Encontrar controlador de ${moduleName} con UID',
      findAll: 'Encontrar o buscar controlador de ${moduleName}',
      valError: 'Error de validación del ${moduleName}',
      update: 'Actualizar controlador de ${moduleName}',
      remove: 'Eliminar controlador de ${moduleName}',
    },
  },
};
`,

	// Controlador - basado en rol.controller.ts
	controller: (moduleName, capitalizedName) => `
import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { UidDTO } from '@/dto/uid.dto';
import { JwtAuthGuard } from '@/modules/security/auth/guards/jwtAuth.guard';
import { ValidPermission } from '@/modules/security/valid-permission/validPermission.decorator';
import { PermissionsGuard } from '@/modules/security/valid-permission/validPermission.guard';
import {
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ${capitalizedName}GetAllDTO } from './dto/${moduleName}GetAll.dto';
import { ${capitalizedName}RegisterDTO } from './dto/${moduleName}Register.dto';
import { ${capitalizedName}UpdateDTO } from './dto/${moduleName}Update.dto';
import { ${capitalizedName} } from './entities/${moduleName}.entity';
import { ${moduleName}Messages } from './${moduleName}.messages';
import { Create${capitalizedName}UseCase } from './use-case/create${capitalizedName}.use-case';
import { FindAll${capitalizedName}sUseCase } from './use-case/findAll${capitalizedName}s.use-case';
import { FindAll${capitalizedName}sPaginationUseCase } from './use-case/findAll${capitalizedName}sPagination.use-case';
import { FindOne${capitalizedName}UseCase } from './use-case/findOne${capitalizedName}.use-case';
import { Find${capitalizedName}PermissionsUseCase } from './use-case/find${capitalizedName}Permissions.use-case';
import { Remove${capitalizedName}UseCase } from './use-case/remove${capitalizedName}.use-case';
import { Update${capitalizedName}UseCase } from './use-case/update${capitalizedName}.use-case';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('${capitalizedName}')
@Controller('${moduleName}')
export class ${capitalizedName}Controller {
	private readonly logger = new Logger(${capitalizedName}Controller.name);

	constructor(
		private readonly create${capitalizedName}UseCase: Create${capitalizedName}UseCase,
		private readonly findOne${capitalizedName}UseCase: FindOne${capitalizedName}UseCase,
		private readonly find${capitalizedName}PermissionsUseCase: Find${capitalizedName}PermissionsUseCase,
		private readonly findAll${capitalizedName}sUseCase: FindAll${capitalizedName}sUseCase,
		private readonly findAll${capitalizedName}sPaginationUseCase: FindAll${capitalizedName}sPaginationUseCase,
		private readonly update${capitalizedName}UseCase: Update${capitalizedName}UseCase,
		private readonly remove${capitalizedName}UseCase: Remove${capitalizedName}UseCase,
	) {}

	@ApiResponse({
		status: 201,
		description: '${capitalizedName} creado correctamente',
		type: ${capitalizedName},
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ValidPermission(Permission.${moduleName}Add)
	@Post()
	async register(@Body() data: ${capitalizedName}RegisterDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.controller.create}\`);

		return this.create${capitalizedName}UseCase.execute({ data, dataLog });
	}

	@ApiResponse({
		status: 200,
		description: '${capitalizedName} encontrado',
		type: ${capitalizedName},
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: '${capitalizedName} no encontrado' })
	@ValidPermission(Permission.${moduleName}ReadOne)
	@Get('/one/:uid')
	async findOne(@Param() data: UidDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.controller.findOne}\`);

		return this.findOne${capitalizedName}UseCase.execute({ uid: data.uid }, dataLog);
	}

	@ApiResponse({
		status: 200,
		description: 'Permisos del ${moduleName}',
		type: [String],
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Get('/per')
	async findPer(@Req() req: ReqUidDTO) {
		const { dataLog, uidRol } = req.user;
		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.controller.findOne}\`);

		return this.find${capitalizedName}PermissionsUseCase.execute({ uid: uidRol, dataLog });
	}

	@ApiResponse({
		status: 200,
		description: '${capitalizedName}s encontrados',
		type: [${capitalizedName}],
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ValidPermission(Permission.${moduleName}Read)
	@Get()
	async findAllPagination(
		@Query() filter: ${capitalizedName}GetAllDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.controller.findAll}\`);

		return this.findAll${capitalizedName}sPaginationUseCase.execute({ filter, dataLog });
	}

	@ApiResponse({
		status: 200,
		description: '${capitalizedName}s encontrados',
		type: [${capitalizedName}],
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Get('/all')
	async findAll(@Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.controller.findAll}\`);

		return this.findAll${capitalizedName}sUseCase.execute({ dataLog });
	}

	@ApiResponse({
		status: 200,
		description: '${capitalizedName} actualizado correctamente',
		type: ${capitalizedName},
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: '${capitalizedName} no encontrado' })
	@ValidPermission(Permission.${moduleName}Update)
	@Patch()
	async update(@Body() data: ${capitalizedName}UpdateDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.controller.update}\`);

		return this.update${capitalizedName}UseCase.execute({ data, dataLog });
	}

	@ApiResponse({
		status: 200,
		description: '${capitalizedName} eliminado correctamente',
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: '${capitalizedName} no encontrado' })
	@ValidPermission(Permission.${moduleName}Delete)
	@Delete('/delete/:uid')
	async delete(@Param() data: UidDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.controller.remove}\`);

		return this.remove${capitalizedName}UseCase.execute({ uid: data.uid, dataLog });
	}
}
`,

	// Módulo - basado en rol.module.ts
	module: (moduleName, capitalizedName) => `
import { UserModule } from '@/modules/security/user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CacheService } from '@/services/cache.service';
import { LoggerService } from '@/services/logger.service';
import { ${capitalizedName} } from './entities/${moduleName}.entity';
import { ${capitalizedName}Repository } from './repository/${moduleName}.repository';
import { ${capitalizedName}Controller } from './${moduleName}.controller';
import { Create${capitalizedName}UseCase } from './use-case/create${capitalizedName}.use-case';
import { FindAll${capitalizedName}sPaginationUseCase } from './use-case/findAll${capitalizedName}sPagination.use-case';
import { FindAll${capitalizedName}sUseCase } from './use-case/findAll${capitalizedName}s.use-case';
import { FindOne${capitalizedName}UseCase } from './use-case/findOne${capitalizedName}.use-case';
import { Find${capitalizedName}PermissionsUseCase } from './use-case/find${capitalizedName}Permissions.use-case';
import { Remove${capitalizedName}UseCase } from './use-case/remove${capitalizedName}.use-case';
import { Update${capitalizedName}UseCase } from './use-case/update${capitalizedName}.use-case';

@Module({
	imports: [
		CacheModule.register(),
		SequelizeModule.forFeature([${capitalizedName}]),
		forwardRef(() => UserModule),
	],
	controllers: [${capitalizedName}Controller],
	providers: [
		LoggerService,
		${capitalizedName}Repository,
		CacheService,
		Create${capitalizedName}UseCase,
		FindOne${capitalizedName}UseCase,
		FindAll${capitalizedName}sPaginationUseCase,
		FindAll${capitalizedName}sUseCase,
		Update${capitalizedName}UseCase,
		Remove${capitalizedName}UseCase,
		Find${capitalizedName}PermissionsUseCase,
	],
	exports: [FindOne${capitalizedName}UseCase, FindAll${capitalizedName}sUseCase, CacheService, LoggerService],
})
export class ${capitalizedName}Module {}
`,

	// DTOs - solo 3 DTOs basados en rol (sin DeleteDto)
	dto: {
		getAll: (moduleName, capitalizedName) =>
			`import { queryDTO } from '@/dto/query.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { Order${capitalizedName}Property } from '../enum/orderProperty';
import { ${moduleName}Messages } from '../${moduleName}.messages';

export class ${capitalizedName}GetAllDTO extends PartialType(queryDTO) {
	@IsOptional()
	@IsEnum(Order${capitalizedName}Property, {
		message: ${moduleName}Messages.validation.dto.enumValue,
	})
	readonly orderProperty?: Order${capitalizedName}Property;
}
`,

		register: (moduleName, capitalizedName) =>
			`export class ${capitalizedName}RegisterDTO {}`,

		update: (moduleName, capitalizedName) =>
			`import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ${moduleName}RegisterDTO } from './${moduleName}Register.dto';
import { ${moduleName}Messages } from '../${moduleName}.messages';

export class ${capitalizedName}UpdateDTO extends ${moduleName}RegisterDTO {
	@IsBoolean({ message: ${moduleName}Messages.validation.dto.status })
	@IsNotEmpty({ message: ${moduleName}Messages.validation.dto.empty })
	@IsOptional()
	readonly status: boolean;
}
`,
	},

	// Entidad - basado en rol.entity.ts
	entity: (moduleName, capitalizedName) => `
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: '${capitalizedName}s' })
export class ${capitalizedName} extends Model<${capitalizedName}> {
	@Column({ primaryKey: true, unique: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
	declare uid: string;

	@Column({ defaultValue: true, allowNull: false, type: DataType.BOOLEAN })
	declare status: boolean;
}
`,

	// Enums - basado en rol (orderProperty.ts y permissions.ts)
	enums: {
		orderProperty: (moduleName, capitalizedName) =>
			`export enum Order${capitalizedName}Property {}`,
	},

	// Repositorio - basado en rol.repository.ts
	repository: (
		moduleName,
		capitalizedName,
	) => `import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
	FindAndCountOptions,
	FindAttributeOptions,
	WhereOptions,
	Includeable,
} from 'sequelize';
import { ${capitalizedName}RegisterDTO } from '../dto/${moduleName}Register.dto';
import { ${capitalizedName} } from '../entities/${moduleName}.entity';
import { CacheService } from '@/services/cache.service';
import { LoggerService } from '@/services/logger.service';

@Injectable()
export class ${capitalizedName}Repository {
	constructor(
		@InjectModel(${capitalizedName}) private readonly ${moduleName}Model: typeof ${capitalizedName},
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
		private readonly cacheService: CacheService,
		private readonly logger: LoggerService,
	) {}

	async create(data: ${capitalizedName}RegisterDTO): Promise<${capitalizedName}> {
		return await this.${moduleName}Model.create(data);
	}

	async findOne(	
	{
		where,
		attributes,
		include,
	}: {
		where: WhereOptions<${capitalizedName}>;
		attributes?: FindAttributeOptions;
		include?: Includeable[];
	}
	): Promise<${capitalizedName} | null> {
		const cacheKey = \`${capitalizedName}-findOne:\${JSON.stringify(where)}\`;
		const cachedData = await this.cacheManager.get<${capitalizedName} | null>(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		const result = await this.${moduleName}Model.findOne({ where,
		...(attributes && { attributes }),
		...(include && { include }),
		});

		if (result) {
			await this.cacheManager.set(cacheKey, result, 1000 * 60);
		}

		return result;
	}

	async findAndCountAll(
		options: FindAndCountOptions<${capitalizedName}>,
	): Promise<{ rows: ${capitalizedName}[]; count: number }> {
		const cacheKey = \`${capitalizedName}-findAndCountAll:\${JSON.stringify(options)}\`;
		const cachedData = await this.cacheManager.get<{ rows: ${capitalizedName}[]; count: number }>(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		const result = await this.${moduleName}Model.findAndCountAll(options);
		await this.cacheManager.set(cacheKey, result, 1000 * 60);

		return result;
	}

	async findAll({
		where,
		attributes,
	}: {
		where: WhereOptions<${capitalizedName}>;
		attributes?: FindAttributeOptions;
	}): Promise<${capitalizedName}[]> {
		const cacheKey = \`${capitalizedName}-findAll:\${JSON.stringify({ where, attributes })}\`;
		const cachedData = await this.cacheManager.get<${capitalizedName}[]>(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		const result = await this.${moduleName}Model.findAll({
			where,
			...(attributes && { attributes }),
		});
		await this.cacheManager.set(cacheKey, result, 1000 * 60);

		return result;
	}

	async update(uid: string, data: Partial<${capitalizedName}>): Promise<void> {
		await this.${moduleName}Model.update(data, { where: { uid } });
	}

	async remove(uid: string): Promise<void> {
		await this.${moduleName}Model.destroy({ where: { uid } });
	}
}
`,

	// Use Cases - 7 use cases basados en rol
	useCases: {
		create: (
			moduleName,
			capitalizedName,
		) => `import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { Injectable, Logger } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { ${capitalizedName}RegisterDTO } from '../dto/${moduleName}Register.dto';
import { ${moduleName}Messages } from '../${moduleName}.messages';
import { ${capitalizedName}Repository } from '../repository/${moduleName}.repository';

@Injectable()
export class Create${capitalizedName}UseCase {
	private readonly logger = new Logger(Create${capitalizedName}UseCase.name);

	constructor(private readonly ${moduleName}Repository: ${capitalizedName}Repository) {}

	async execute({ data, dataLog }: { data: ${capitalizedName}RegisterDTO; dataLog: string }) {
		const { name } = data;
		const whereClause: WhereOptions<${capitalizedName}> = { name };
		const existing = await this.${moduleName}Repository.findOne({where: whereClause});

		validatePropertyData({
			property: { name },
			data: existing as unknown as Record<string, unknown> ?? undefined,
			msg: ${moduleName}Messages,
		});

		await this.${moduleName}Repository.create(data as ${capitalizedName});

		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.createSuccess}\`);

		return { msg: ${moduleName}Messages.register };
	}
}
`,

		findAll: (
			moduleName,
			capitalizedName,
		) => `import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '@/services/cache.service';
import { LoggerService } from '@/services/logger.service';
import { ${moduleName}Messages } from '../${moduleName}.messages';
import { ${capitalizedName}Repository } from '../repository/${moduleName}.repository';

@Injectable()
export class FindAll${capitalizedName}sUseCase {
	private readonly CACHE_TTL = 3600000;

	constructor(
		private readonly ${moduleName}Repository: ${capitalizedName}Repository,
		private readonly cacheService: CacheService,
		private readonly logger: LoggerService,
	) {}

	async execute({ dataLog }: { dataLog: string }) {
		const cacheKey = this.cacheService.buildRoleListKey();

		const cached =
			await this.cacheService.get<{ value: string; label: string }[]>(cacheKey);
		if (cached) {
			this.logger.debug(\`Retornando ${moduleName}s desde caché: \${cacheKey}\`, {
				type: '${moduleName}_find_all',
				fromCache: true,
			});
			return cached;
		}

		const ${moduleName} = await this.${moduleName}Repository.findAll({
			where: { status: true },
			attributes: ['uid', 'name'],
		});

		const formatterData = ${moduleName}.map(item => ({
			value: item.uid,
			label: item.name,
		}));

		await this.cacheService.set(cacheKey, formatterData, this.CACHE_TTL);

		this.logger.info(\`\${dataLog} - \${${moduleName}Messages.log.findAllSuccess}\`, {
			type: '${moduleName}_find_all',
			count: formatterData.length,
			fromCache: false,
		});

		this.logger.logMetric('${moduleName}.buscar_todos', formatterData.length);

		return formatterData;
	}
}
`,

		findAllPagination: (
			moduleName,
			capitalizedName,
		) => `import { Order } from '@/constants/dataConstants';
import { booleanStatus } from '@/functions/booleanStatus';
import { PaginationResult } from '@/types';
import { Injectable, Logger } from '@nestjs/common';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { ${capitalizedName}GetAllDTO } from '../dto/${moduleName}GetAll.dto';
import { ${capitalizedName} } from '../entities/${capitalizedName}.entity';
import { Order${capitalizedName}Property } from '../enum/orderProperty';
import { ${moduleName}Messages } from '../${moduleName}.messages';
import { ${capitalizedName}Repository } from '../repository/${moduleName}.repository';

@Injectable()
export class FindAll${capitalizedName}sPaginationUseCase {
	private readonly logger = new Logger(FindAll${capitalizedName}sPaginationUseCase.name);

	constructor(
		private readonly ${moduleName}Repository: ${capitalizedName}Repository,
	) {}

	async execute({
		filter,
		dataLog,
	}: {
		filter: ${capitalizedName}GetAllDTO;
		dataLog: string;
	}): Promise<PaginationResult<${capitalizedName}>> {
		const {
			limit = 30,
			page = 1,
			search,
			status: olStatus,
			orderProperty = Order${capitalizedName}Property.,
			order = Order.ASC,
		} = filter;

		const status = olStatus ? booleanStatus({ status: olStatus }) : true;
		const parsedLimit = Number(limit);
		const parsedPage = Number(page);

		const where = this.buildWhereClause(status, search);
		const queryOptions = this.buildQueryOptions(
			where,
			orderProperty,
			order,
			parsedLimit,
			parsedPage,
		);

		const { rows, count } =
			await this.${moduleName}Repository.findAndCountAll(queryOptions);

		const result = {
			rows,
			count,
			...this.calculatePagination(count, parsedLimit, parsedPage),
		};

		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.findAllSuccess}\`);

		return result;
	}

	private buildWhereClause(
		status: boolean,
		search?: string,
	): WhereOptions<${capitalizedName}> {
		const where: WhereOptions<${capitalizedName}> = { status };

		if (search) {
			where[Op.or] = [];
			where[Op.or].push({ name: { [Op.iLike]: \`%\${search}%\` } });
		}

		return where;
	}

	private buildQueryOptions(
		where: WhereOptions<${capitalizedName}>,
		orderProperty: Order${capitalizedName}Property,
		order: Order,
		limit: number,
		page: number,
	): FindAndCountOptions<${capitalizedName}> {
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
`,

		findOne: (
			moduleName,
			capitalizedName,
		) => `import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { ${capitalizedName} } from '../entities/${capitalizedName}.entity';
import { ${moduleName}Messages } from '../${moduleName}.messages';
import { ${capitalizedName}Repository } from '../repository/${moduleName}.repository';

@Injectable()
export class FindOne${capitalizedName}UseCase {
	private readonly logger = new Logger(FindOne${capitalizedName}UseCase.name);

	constructor(private readonly ${moduleName}Repository: ${capitalizedName}Repository) {}

	async execute(where: WhereOptions<${capitalizedName}>, dataLog?: string) {
		const ${moduleName} = await this.${moduleName}Repository.findOne({
			where: {
				...where,
				status: true,}
		});

		if (!${moduleName}) {
			this.logger.error(
				\`\${dataLog ? dataLog : 'system'} - No se encontro el ${moduleName}\`,
			);
			throw new NotFoundException(${moduleName}Messages.findOne);
		}

		this.logger.log(\`\${dataLog ? dataLog : 'system'} - Exito al buscar el ${moduleName}\`);

		return ${moduleName};
	}
}
`,

		findPermissions: (
			moduleName,
			capitalizedName,
		) => `import { objectError } from '@/functions/objectError';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { Injectable, Logger } from '@nestjs/common';
import { ${capitalizedName}Repository } from '../repository/${moduleName}.repository';
import { ${moduleName}Messages } from '../${moduleName}.messages';

@Injectable()
export class Find${capitalizedName}PermissionsUseCase {
	private readonly logger = new Logger(Find${capitalizedName}PermissionsUseCase.name);

	constructor(private readonly ${moduleName}Repository: ${capitalizedName}Repository) {}
	
	async execute({ uid, dataLog }: { uid: string; dataLog: string }) {
		const ${moduleName} = await this.${moduleName}Repository.findOne({
			where: {
				uid,
				status: true,
			},
			attributes: ['uid', 'name', 'permissions'],
		});

		if (!${moduleName}) {
			this.logger.error(\`\${dataLog} - \${${moduleName}Messages.log.${moduleName}Error}\`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'uid', msg: ${moduleName}Messages.findOne }),
			);
		}

		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.findOneSuccess}\`);

		return ${moduleName};
	}
}
`,

		remove: (
			moduleName,
			capitalizedName,
		) => `import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ${moduleName}Messages } from '../${moduleName}.messages';
import { ${capitalizedName}Repository } from '../repository/${moduleName}.repository';

@Injectable()
export class Remove${capitalizedName}UseCase {
	private readonly logger = new Logger(Remove${capitalizedName}UseCase.name);

	constructor(
		private readonly ${moduleName}Repository: ${capitalizedName}Repository,
	) {}

	async execute({ uid, dataLog }: { uid: string; dataLog: string }) {
		const ${moduleName} = await this.${moduleName}Repository.findOne({ where: { uid, status: true } });
	
		if (!${moduleName}) {
			this.logger.error(\`\${dataLog} - \${${moduleName}Messages.log.${moduleName}Error}\`);
			throw new NotFoundException(${moduleName}Messages.findOne);
		}

		await this.${moduleName}Repository.remove(uid);

		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.removeSuccess}\`);

		return { msg: ${moduleName}Messages.delete };
	}
}
`,

		update: (
			moduleName,
			capitalizedName,
		) => `import { Injectable, Logger } from '@nestjs/common';
import { ${capitalizedName}UpdateDTO } from '../dto/${moduleName}Update.dto';
import { ${moduleName}Messages } from '../${moduleName}.messages';
import { ${capitalizedName}Repository } from '../repository/${moduleName}.repository';

@Injectable()
export class Update${capitalizedName}UseCase {
	private readonly logger = new Logger(Update${capitalizedName}UseCase.name);

	constructor(private readonly ${moduleName}Repository: ${capitalizedName}Repository) {}

	async execute({ data, dataLog }: { data: ${capitalizedName}UpdateDTO; dataLog: string }) {
		const { uid, ...updatedData } = data;
		const ${moduleName} = await this.${moduleName}Repository.findOne({ where: { uid } });
		if (!${moduleName}) {
			this.logger.error(\`\${dataLog} - \${${moduleName}Messages.log.${moduleName}Error}\`);
			throw new NotFoundException(${moduleName}Messages.findOne);
		}

		await ${moduleName}.update({
			...updatedData,
			...(updatedData.status !== undefined && { status: !updatedData.status }),
		});

		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.updateSuccess}\`);

		return { msg: ${moduleName}Messages.update };
	}
}
`,
	},

	// Types definition file
	types: moduleName => `// Types for ${moduleName} module
`,
};
