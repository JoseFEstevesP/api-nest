import { AuditModule } from '@/modules/security/audit/audit.module';
import { RolModule } from '@/modules/security/rol/rol.module';
import { EmailService } from '@/services/email.service';
import { forwardRef, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { ActivateAccountUseCase } from './use-case/activateAccount';
import { CreateProtectUserUseCase } from './use-case/createProtectUser';
import { CreateUserUseCase } from './use-case/createUser';
import { FindAllUsersUseCase } from './use-case/findAllUsers';
import { FindOneUserUseCase } from './use-case/findOneUser';
import { FindUserByIdUseCase } from './use-case/findUserByEmail';
import { FindUserForAuthUseCase } from './use-case/findUserById';
import { GetUserProfileUseCase } from './use-case/getUserProfile';
import { RecoveryPasswordUseCase } from './use-case/recoveryPassword';
import { RecoveryVerifyPasswordUseCase } from './use-case/recoveryVerifyPassword';
import { RemoveUserUseCase } from './use-case/removeUser';
import { SetNewPasswordUseCase } from './use-case/setNewPassword';
import { UnregisterUserUseCase } from './use-case/unregisterUser';
import { UpdateUserUseCase } from './use-case/updateUser';
import { UpdateUserProfileUseCase } from './use-case/updateUserProfile';
import { UpdateUserProfileEmailUseCase } from './use-case/updateUserProfileEmail';
import { UpdateUserProfilePasswordUseCase } from './use-case/updateUserProfilePassword';
import { ValidateAttemptUseCase } from './use-case/validateAttempt';
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
