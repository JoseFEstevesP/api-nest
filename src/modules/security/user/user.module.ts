import { AuditModule } from '@/modules/security/audit/audit.module';
import { RolModule } from '@/modules/security/rol/rol.module';
import { EmailService } from '@/services/email.service';
import { forwardRef, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { ActivateAccountUseCase } from './use-case/activateAccount.use-case';
import { CreateProtectUserUseCase } from './use-case/createProtectUser.use-case';
import { CreateUserUseCase } from './use-case/createUser.use-case';
import { FindAllUsersUseCase } from './use-case/findAllUsers.use-case';
import { FindOneUserUseCase } from './use-case/findOneUser.use-case';
import { FindUserByIdUseCase } from './use-case/findUserByEmail.use-case';
import { FindUserForAuthUseCase } from './use-case/findUserById.use-case';
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
		SequelizeModule.forFeature([User]),
		forwardRef(() => AuditModule),
		forwardRef(() => RolModule),
	],
	controllers: [UserController],

	providers: [
		EmailService,
		JwtService,
		UserRepository,
		CreateUserUseCase,
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
		FindUserForAuthUseCase,
		FindUserByIdUseCase,
		ValidateAttemptUseCase,
		RecoveryPasswordUseCase,
		RecoveryVerifyPasswordUseCase,
	],
	exports: [
		UserRepository,
		FindOneUserUseCase,
		FindUserForAuthUseCase,
		ValidateAttemptUseCase,
	],
})
export class UserModule {}
