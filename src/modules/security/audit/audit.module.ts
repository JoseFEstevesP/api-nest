import { AuthAuditGateway } from '@/modules/security/auth/ports/auth-audit.gateway';
import { RolModule } from '@/modules/security/rol/rol.module';
import { DatabaseModule } from '@/shared/database/database.module';
import { Module } from '@nestjs/common';
import { AuditAuthAdapter } from './adapters/audit-auth.adapter';
import { AuditController } from './audit.controller';
import { CleanUpOldAuditsUseCase } from './use-case/cleanUpOldAudits.use-case';
import { CreateAuditUseCase } from './use-case/createAudit.use-case';
import { FindAllAuditsUseCase } from './use-case/findAllAudits.use-case';
import { FindOneAuditUseCase } from './use-case/findOneAudit.use-case';
import { RemoveAuditUseCase } from './use-case/removeAudit.use-case';
import { UpdateAuditUseCase } from './use-case/updateAudit.use-case';

@Module({
	imports: [DatabaseModule, RolModule],
	controllers: [AuditController],
	providers: [
		{ provide: AuthAuditGateway, useClass: AuditAuthAdapter },
		RemoveAuditUseCase,
		CreateAuditUseCase,
		FindAllAuditsUseCase,
		FindOneAuditUseCase,
		UpdateAuditUseCase,
		CleanUpOldAuditsUseCase,
	],
	exports: [
		AuthAuditGateway,
		RemoveAuditUseCase,
		CreateAuditUseCase,
		FindAllAuditsUseCase,
		FindOneAuditUseCase,
		UpdateAuditUseCase,
	],
})
export class AuditModule {}
