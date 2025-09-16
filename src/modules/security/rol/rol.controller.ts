import { ReqUidDTO } from '@/dto/ReqUid.dto';
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
import { RolDeleteDTO } from './dto/rolDelete.dto';
import { RolGetDTO } from './dto/rolGet.dto';
import { RolGetAllDTO } from './dto/rolGetAll.dto';
import { RolRegisterDTO } from './dto/rolRegister.dto';
import { RolUpdateDTO } from './dto/rolUpdate.dto';
import { Role } from './entities/rol.entity';
import { Permission } from './enum/permissions';
import { rolMessages } from './rol.messages';
import { CreateRolUseCase } from './use-case/createRol.use-case';
import { FindAllRolsUseCase } from './use-case/findAllRols.use-case';
import { FindAllRolsPaginationUseCase } from './use-case/findAllRolsPagination.use-case';
import { FindOneRolUseCase } from './use-case/findOneRol.use-case';
import { FindRolPermissionsUseCase } from './use-case/findRolPermissions.use-case';
import { RemoveRolUseCase } from './use-case/removeRol.use-case';
import { UpdateRolUseCase } from './use-case/updateRol.use-case';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Rol')
@Controller('rol')
export class RolController {
	private readonly logger = new Logger(RolController.name);

	constructor(
		private readonly createRolUseCase: CreateRolUseCase,
		private readonly findOneRolUseCase: FindOneRolUseCase,
		private readonly findRolPermissionsUseCase: FindRolPermissionsUseCase,
		private readonly findAllRolsPaginationUseCase: FindAllRolsPaginationUseCase,
		private readonly findAllRolsUseCase: FindAllRolsUseCase,
		private readonly updateRolUseCase: UpdateRolUseCase,
		private readonly removeRolUseCase: RemoveRolUseCase,
	) {}

	@ApiResponse({
		status: 201,
		description: 'Rol creado correctamente',
		type: Role,
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ValidPermission(Permission.rolAdd)
	@Post()
	async register(@Body() data: RolRegisterDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.create}`);

		return this.createRolUseCase.execute({ data, dataLog });
	}

	@ApiResponse({
		status: 200,
		description: 'Rol encontrado',
		type: Role,
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Rol no encontrado' })
	@ValidPermission(Permission.rolReadOne)
	@Get('/one/:uid')
	async findOne(@Param() data: RolGetDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.findOne}`);

		return this.findOneRolUseCase.execute({ uid: data.uid }, dataLog);
	}

	@ApiResponse({
		status: 200,
		description: 'Permisos del rol',
		type: [String],
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Get('/per')
	async findPer(@Req() req: ReqUidDTO) {
		const { dataLog, uidRol } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.findOne}`);

		return this.findRolPermissionsUseCase.execute({ uid: uidRol, dataLog });
	}

	@ApiResponse({
		status: 200,
		description: 'Roles encontrados',
		type: [Role],
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ValidPermission(Permission.rolRead)
	@Get()
	async findAllPagination(
		@Query() filter: RolGetAllDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.findAll}`);

		return this.findAllRolsPaginationUseCase.execute({ filter, dataLog });
	}

	@ApiResponse({
		status: 200,
		description: 'Roles encontrados',
		type: [Role],
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Get('/all')
	async findAll(@Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.findAll}`);

		return this.findAllRolsUseCase.execute({ dataLog });
	}

	@ApiResponse({
		status: 200,
		description: 'Rol actualizado correctamente',
		type: Role,
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Rol no encontrado' })
	@ValidPermission(Permission.rolUpdate)
	@Patch()
	async update(@Body() data: RolUpdateDTO, @Req() req: ReqUidDTO) {
		const { dataLog, uidRol } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.update}`);

		return this.updateRolUseCase.execute({ data, dataLog });
	}

	@ApiResponse({
		status: 200,
		description: 'Rol eliminado correctamente',
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Rol no encontrado' })
	@ValidPermission(Permission.rolDelete)
	@Delete('/delete/:uid')
	async delete(@Param() data: RolDeleteDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.remove}`);

		return this.removeRolUseCase.execute({ uid: data.uid, dataLog });
	}
}
