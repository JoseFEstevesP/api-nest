import { AuditModule } from '@/modules/security/audit/audit.module';
import { RolModule } from '@/modules/security/rol/rol.module';
import { EmailService } from '@/services/email.service';
import { forwardRef, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	imports: [
		SequelizeModule.forFeature([User]),
		forwardRef(() => AuditModule),
		forwardRef(() => RolModule),
	],
	controllers: [UserController],
	providers: [UserService, EmailService, JwtService],
	exports: [UserService, SequelizeModule.forFeature([User])],
})
export class UserModule {}
