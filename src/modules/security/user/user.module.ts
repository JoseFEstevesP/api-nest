import { AuditModule } from '@/modules/security/audit/audit.module';
import { JwtModule } from '@/modules/security/jwt/jwt.module';
import { RolModule } from '@/modules/security/rol/rol.module';
import { EmailService } from '@/services/email.service';
import { LoggerService } from '@/services/logger.service';
import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from '../rol/entities/rol.entity';
import { User } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { ActivateAccountUseCase } from './use-case/activateAccount.use-case';
import { CreateProtectUserUseCase } from './use-case/createProtectUser.use-case';
import { FindAllUsersUseCase } from './use-case/findAllUsers.use-case';
import { FindOneUserUseCase } from './use-case/findOneUser.use-case';
import { FindOneUserByUidUseCase } from './use-case/findOneUserByUid.use-case';
import { FindUserByIdUseCase } from './use-case/findUserByEmail.use-case';
import { FindUserForAuthUseCase } from './use-case/findUserById.use-case';
import { GetUserChartsUseCase } from './use-case/getUserCharts.use-case';
import { GetUserProfileUseCase } from './use-case/getUserProfile.use-case';
import { RecoveryPasswordUseCase } from './use-case/recoveryPassword.use-case';
import { RecoveryVerifyPasswordUseCase } from './use-case/recoveryVerifyPassword.use-case';
import { RemoveUserUseCase } from './use-case/removeUser.use-case';
import { SetNewPasswordUseCase } from './use-case/setNewPassword.use-case';
import { UnregisterUserUseCase } from './use-case/unregisterUser.use-case';
import { UpdateUserUseCase } from './use-case/updateUser.use-case';
import { UpdateUserProfileUseCase } from './use-case/updateUserProfile.use-case';
import { UpdateUserProfileEmailUseCase } from './use-case/updateUserProfileEmail.use-case';
import { UpdateUserProfilePasswordUseCase } from './use-case/updateUserProfilePassword.use-case';
import { ValidateAttemptUseCase } from './use-case/validateAttempt.use-case';
import { UserController } from './user.controller';

@Module({
	imports: [
		SequelizeModule.forFeature([User, Role]),
		forwardRef(() => AuditModule),
		forwardRef(() => RolModule),
		JwtModule,
	],

	controllers: [UserController],

	providers: [
		LoggerService,
		EmailService,
		UserRepository,
		CreateProtectUserUseCase,
		FindAllUsersUseCase,
		UpdateUserUseCase,
		RemoveUserUseCase,
		GetUserProfileUseCase,
		UpdateUserProfileUseCase,
		UpdateUserProfileEmailUseCase,
		UpdateUserProfilePasswordUseCase,
		UnregisterUserUseCase,
		SetNewPasswordUseCase,
		ActivateAccountUseCase,
		FindOneUserUseCase,
		FindOneUserByUidUseCase,
		FindUserForAuthUseCase,
		FindUserByIdUseCase,
		ValidateAttemptUseCase,
		RecoveryPasswordUseCase,
		RecoveryVerifyPasswordUseCase,
		GetUserChartsUseCase,
	],
	exports: [
		UserRepository,
		FindOneUserUseCase,
		FindOneUserByUidUseCase,
		FindUserForAuthUseCase,
		ValidateAttemptUseCase,
		LoggerService,
	],
})
export class UserModule {}
