import { AuditModule } from '@/modules/security/audit/audit.module';
import { RolModule } from '@/modules/security/rol/rol.module';
import { UserModule } from '@/modules/security/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggerService } from '@/services/logger.service';
import { AuthController } from './auth.controller';
import { LoginUseCase } from './use-case/login.use-case';
import { LogoutUseCase } from './use-case/logout.use-case';
import { RefreshTokenUseCase } from './use-case/refreshToken.use-case';
import { CheckSessionUseCase } from './use-case/checkSession.use-case';

@Module({
	imports: [
		UserModule,
		AuditModule,
		forwardRef(() => RolModule),
		SequelizeModule.forFeature([]),
	],
	controllers: [AuthController],
	providers: [
		LoggerService,
		LoginUseCase,
		LogoutUseCase,
		RefreshTokenUseCase,
		CheckSessionUseCase,
	],
	exports: [LoggerService, forwardRef(() => UserModule)],
})
export class AuthModule {}
