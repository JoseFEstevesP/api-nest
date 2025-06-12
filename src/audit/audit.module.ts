import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { Audit } from './entities/audit.entity';
import { SharedModule } from '@/shared/shared.module';
import { RolModule } from '@/rol/rol.module';

@Module({
	imports: [SequelizeModule.forFeature([Audit]), SharedModule, RolModule],
	controllers: [AuditController],
	providers: [AuditService],
	exports: [AuditService],
})
export class AuditModule {}
