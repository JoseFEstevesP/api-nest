import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { JwtAuthGuard } from '@/modules/security/auth/guards/jwt-auth.guard';
import { ValidPermission } from '@/modules/security/valid-permission/valid-permission.decorator';
import { PermissionsGuard } from '@/modules/security/valid-permission/valid-permission.guard';
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolDeleteDTO } from './dto/rolDelete.dto';
import { RolGetDTO } from './dto/rolGet.dto';
import { RolGetAllDTO } from './dto/rolGetAll.dto';
import { RolRegisterDTO } from './dto/rolRegister.dto';
import { RolUpdateDTO } from './dto/rolUpdate.dto';
import { Permission } from './enum/permissions';
import { msg } from './msg';
import { CreateRolUseCase } from './use-case/create-rol.use-case';
import { FindAllRolsPaginationUseCase } from './use-case/find-all-rols-pagination.use-case';
import { FindAllRolsUseCase } from './use-case/find-all-rols.use-case';
import { FindOneRolUseCase } from './use-case/find-one-rol.use-case';
import { FindRolPermissionsUseCase } from './use-case/find-rol-permissions.use-case';
import { RemoveRolUseCase } from './use-case/remove-rol.use-case';
import { UpdateRolUseCase } from './use-case/update-rol.use-case';

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

	@ValidPermission(Permission.rolAdd)
	@Post()
	async register(@Body() data: RolRegisterDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.create}`);

		return this.createRolUseCase.execute({ data, dataLog });
	}

	@ValidPermission(Permission.rolReadOne)
	@Get('/one/:uid')
	async findOne(@Param() data: RolGetDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.findOne}`);

		return this.findOneRolUseCase.execute({ uid: data.uid }, dataLog);
	}

	@Get('/per')
	async findPer(@Req() req: ReqUidDTO) {
		const { dataLog, uidRol } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.findOne}`);

		return this.findRolPermissionsUseCase.execute({ uid: uidRol, dataLog });
	}

	@ValidPermission(Permission.rolRead)
	@Get()
	async findAllPagination(
		@Query() filter: RolGetAllDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.findAll}`);

		return this.findAllRolsPaginationUseCase.execute({ filter, dataLog });
	}

	@Get('/all')
	async findAll(@Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.findAll}`);

		return this.findAllRolsUseCase.execute({ dataLog });
	}

	@ValidPermission(Permission.rolUpdate)
	@Patch()
	async update(@Body() data: RolUpdateDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.update}`);

		return this.updateRolUseCase.execute({ data, dataLog });
	}

	@ValidPermission(Permission.rolDelete)
	@Delete('/delete/:uid')
	async delete(@Param() data: RolDeleteDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.remove}`);

		return this.removeRolUseCase.execute({ uid: data.uid, dataLog });
	}
}
