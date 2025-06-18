import { AuditModule } from '@/modules/security/audit/audit.module';
import { RolModule } from '@/modules/security/rol/rol.module';
import { SharedModule } from '@/shared/shared.module';
import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	imports: [
		SequelizeModule.forFeature([User]),
		SharedModule,
		forwardRef(() => AuditModule),
		forwardRef(() => RolModule),
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService, SequelizeModule.forFeature([User])],
})
export class UserModule {}
