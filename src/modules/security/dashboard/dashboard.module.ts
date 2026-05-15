import { AuditModule } from '@/modules/security/audit/audit.module';
import { UserModule } from '@/modules/security/user/user.module';
import { LoggerService } from '@/services/logger.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Audit } from '@/modules/security/audit/entities/audit.entity';
import { DashboardController } from './dashboard.controller';
import { GetDashboardDataUseCase } from './use-case/getDashboardData.use-case';

@Module({
	imports: [
		SequelizeModule.forFeature([Audit]),
		UserModule,
		AuditModule,
	],
	controllers: [DashboardController],
	providers: [
		LoggerService,
		GetDashboardDataUseCase,
	],
})
export class DashboardModule {}
