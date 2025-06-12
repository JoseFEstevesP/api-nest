import { AuditService } from '@/audit/audit.service';
import { Audit } from '@/audit/entities/audit.entity';
import { Role } from '@/rol/entities/rol.entity';
import { RolService } from '@/rol/rol.service';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
	imports: [SequelizeModule.forFeature([User, Role, Audit])],
	providers: [UserService, RolService, AuditService],
	exports: [UserService, RolService, AuditService],
})
export class SharedServicesModule {}
