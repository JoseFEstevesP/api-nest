import { RolModule } from '@/modules/security/rol/rol.module';
import { SharedModule } from '@/shared/shared.module';
import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { Audit } from './entities/audit.entity';

@Module({
	imports: [
		SequelizeModule.forFeature([Audit]),
		SharedModule,
		forwardRef(() => RolModule),
	],
	controllers: [AuditController],
	providers: [AuditService],
	exports: [AuditService],
})
export class AuditModule {}
