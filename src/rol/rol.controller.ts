import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { ValidPermission } from '@/valid-permission/valid-permission.decorator';
import { PermissionsGuard } from '@/valid-permission/valid-permission.guard';
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
import { RolService } from './rol.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Rol')
@Controller('rol')
export class RolController {
	private readonly logger = new Logger(RolController.name);

	constructor(private readonly rolService: RolService) {}

	@ValidPermission(Permission.rolAdd)
	@Post()
	async register(@Body() data: RolRegisterDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.create}`);

		return this.rolService.create({ data, dataLog });
	}

	@ValidPermission(Permission.rolReadOne)
	@Get('/one/:uid')
	async findOne(@Param() data: RolGetDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.findOne}`);

		return this.rolService.findOne({ uid: data.uid }, dataLog);
	}

	@Get('/per')
	async findPer(@Req() req: ReqUidDTO) {
		const { dataLog, uidRol } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.findOne}`);

		return this.rolService.findPer({ uid: uidRol, dataLog });
	}

	@ValidPermission(Permission.rolRead)
	@Get()
	async findAllPagination(
		@Query() filter: RolGetAllDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.findAll}`);

		return this.rolService.findAllPagination({ filter, dataLog });
	}

	@Get('/all')
	async findAll(@Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.findAll}`);

		return this.rolService.findAll({ dataLog });
	}

	@ValidPermission(Permission.rolUpdate)
	@Patch()
	async update(@Body() data: RolUpdateDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.update}`);

		return this.rolService.update({ data, dataLog });
	}

	@ValidPermission(Permission.rolDelete)
	@Delete('/delete/:uid')
	async delete(@Param() data: RolDeleteDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.remove}`);

		return this.rolService.remove({ uid: data.uid, dataLog });
	}
}
