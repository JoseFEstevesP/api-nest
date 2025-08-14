import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { JwtAuthGuard } from '@/modules/security/auth/guards/jwtAuth.guard';
import { Permission } from '@/modules/security/rol/enum/permissions';
import { ValidPermission } from '@/modules/security/valid-permission/validPermission.decorator';
import { PermissionsGuard } from '@/modules/security/valid-permission/validPermission.guard';
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
import { AuditGetAllDTO } from './dto/auditGetAll.dto';
import { msg } from './msg';
import { FindAllAuditsUseCase } from './use-case/findAllAudits.use-case';
import { RemoveAuditUseCase } from './use-case/removeAudit.use-case';

@ApiBearerAuth()
@ApiTags('Audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit')
export class AuditController {
	private readonly logger = new Logger(AuditController.name);

	constructor(
		private readonly findAllAuditsUseCase: FindAllAuditsUseCase,
		private readonly removeAuditUseCase: RemoveAuditUseCase,
	) {}

	@ValidPermission(Permission.auditRead)
	@Get()
	async findAllPagination(
		@Query() filter: AuditGetAllDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.controller.findAll}`);

		return this.findAllAuditsUseCase.execute({
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

		return this.removeAuditUseCase.execute({ uid }, dataLog);
	}
}
