import { AuditModule } from '@/audit/audit.module';
import { SharedModule } from '@/shared/shared.module';
import { SharedServicesModule } from '@/shared/SharedServices.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	imports: [
		SequelizeModule.forFeature([User]),
		SharedModule,
		AuditModule,
		SharedServicesModule,
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService, SequelizeModule.forFeature([User])],
})
export class UserModule {}
