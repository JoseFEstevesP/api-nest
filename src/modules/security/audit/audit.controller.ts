import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { JwtAuthGuard } from '@/modules/security/auth/guards/jwt-auth.guard';
import { Permission } from '@/modules/security/rol/enum/permissions';
import { ValidPermission } from '@/modules/security/valid-permission/valid-permission.decorator';
import { PermissionsGuard } from '@/modules/security/valid-permission/valid-permission.guard';
import {
	Controller,
	Delete,
	Get,
	Logger,
	Param,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditGetAllDTO } from './dto/auditGetAll.dto';
import { msg } from './msg';

@ApiBearerAuth()
@ApiTags('Audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit')
export class AuditController {
	private readonly logger = new Logger(AuditController.name);

	constructor(private readonly auditService: AuditService) {}

	@ValidPermission(Permission.auditRead)
	@Get()
	async findAllPagination(
		@Query() filter: AuditGetAllDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.findAll}`);

		return this.auditService.findAll({
			filter,
			uidUser: uid,
			dataLog,
		});
	}

	@ValidPermission(Permission.auditDelete)
	@Delete('/delete/:uid')
	async delete(@Param('uid') uid: string, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.remove}`);

		return this.auditService.remove({ uid }, dataLog);
	}
}
