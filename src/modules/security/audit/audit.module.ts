import { RolModule } from '@/modules/security/rol/rol.module';
import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditController } from './audit.controller';
import { Audit } from './entities/audit.entity';
import { CreateAuditUseCase } from './use-case/create-audit.use-case';
import { FindAllAuditsUseCase } from './use-case/find-all-audits.use-case';
import { FindOneAuditUseCase } from './use-case/find-one-audit.use-case';
import { RemoveAuditUseCase } from './use-case/remove-audit.use-case';
import { UpdateAuditUseCase } from './use-case/update-audit.use-case';
import { CleanUpOldAuditsUseCase } from './use-case/clean-up-old-audits.use-case';

@Module({
	imports: [SequelizeModule.forFeature([Audit]), forwardRef(() => RolModule)],
	controllers: [AuditController],
	providers: [
		RemoveAuditUseCase,
		CreateAuditUseCase,
		FindAllAuditsUseCase,
		FindOneAuditUseCase,
		UpdateAuditUseCase,
		CleanUpOldAuditsUseCase,
	],
	exports: [
		RemoveAuditUseCase,
		CreateAuditUseCase,
		FindAllAuditsUseCase,
		FindOneAuditUseCase,
		UpdateAuditUseCase,
		CleanUpOldAuditsUseCase,
	],
})
export class AuditModule {}
