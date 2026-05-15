import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { JwtAuthGuard } from '@/modules/security/auth/guards/jwtAuth.guard';
import { Permission } from '@/modules/security/rol/enum/permissions';
import { ValidPermission } from '@/modules/security/valid-permission/validPermission.decorator';
import { PermissionsGuard } from '@/modules/security/valid-permission/validPermission.guard';
import { Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardResponseDTO } from './dto/dashboard.dto';
import { GetDashboardDataUseCase } from './use-case/getDashboardData.use-case';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
	private readonly logger = new Logger(DashboardController.name);

	constructor(
		private readonly getDashboardDataUseCase: GetDashboardDataUseCase,
	) {}

	@ValidPermission(Permission.dashboardRead)
	@ApiResponse({
		status: 200,
		description: 'Datos del dashboard obtenidos correctamente',
		type: DashboardResponseDTO,
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@Get()
	async getDashboard(@Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - Obteniendo datos del dashboard`);

		return this.getDashboardDataUseCase.execute({ dataLog });
	}
}
