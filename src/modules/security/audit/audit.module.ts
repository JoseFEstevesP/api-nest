import { RolModule } from '@/modules/security/rol/rol.module';
import { LoggerService } from '@/services/logger.service';
import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditController } from './audit.controller';
import { Audit } from './entities/audit.entity';
import { AuditRepository } from './repository/audit.repository';
import { CleanUpOldAuditsUseCase } from './use-case/cleanUpOldAudits.use-case';
import { CreateAuditUseCase } from './use-case/createAudit.use-case';
import { FindAllAuditsUseCase } from './use-case/findAllAudits.use-case';
import { FindOneAuditUseCase } from './use-case/findOneAudit.use-case';
import { RemoveAuditUseCase } from './use-case/removeAudit.use-case';
import { UpdateAuditUseCase } from './use-case/updateAudit.use-case';

@Module({
	imports: [SequelizeModule.forFeature([Audit]), forwardRef(() => RolModule)],
	controllers: [AuditController],
	providers: [
		AuditRepository,
		RemoveAuditUseCase,
		CreateAuditUseCase,
		FindAllAuditsUseCase,
		FindOneAuditUseCase,
		UpdateAuditUseCase,
		CleanUpOldAuditsUseCase,
		LoggerService,
	],
	exports: [
		AuditRepository,
		RemoveAuditUseCase,
		CreateAuditUseCase,
		FindAllAuditsUseCase,
		FindOneAuditUseCase,
		UpdateAuditUseCase,
		CleanUpOldAuditsUseCase,
		LoggerService,
	],
})
export class AuditModule {}
