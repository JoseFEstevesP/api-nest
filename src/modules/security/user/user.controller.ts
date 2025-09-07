import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { JwtAuthGuard } from '@/modules/security/auth/guards/jwtAuth.guard';
import { Permission } from '@/modules/security/rol/enum/permissions';
import { ValidPermission } from '@/modules/security/valid-permission/validPermission.decorator';
import { PermissionsGuard } from '@/modules/security/valid-permission/validPermission.guard';
import {
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserActivateCountDTO } from './dto/userActivateCount.dto';
import { UserDefaultRegisterDTO } from './dto/userDefaultRegister.dto';
import { UserDeleteDTO } from './dto/userDelete.dto';
import { UserGetAllDTO } from './dto/userGetAll.dto';
import { UserNewPasswordDTO } from './dto/userNewPassword.dto';
import { UserRecoveryPasswordDTO } from './dto/userRecoveryPassword.dto';
import { RecoveryVerifyPasswordDTO } from './dto/userRecoveryVerifyPassword.dto';
import { UserRegisterDTO } from './dto/userRegister.dto';
import { UserUpdateDTO } from './dto/userUpdate.dto';
import { UserUpdatePasswordDTO } from './dto/userUpdatePassword.dto';
import { UserUpdateProfileDataDTO } from './dto/userUpdateProfileData.dto';
import { UserUpdateProfileEmailDTO } from './dto/userUpdateProfileEmail.dto';
import { UserUpdateProfilePasswordDTO } from './dto/userUpdateProfilePassword.dto';
import { User } from './entities/user.entity';
import { ActivateAccountUseCase } from './use-case/activateAccount.use-case';
import { CreateProtectUserUseCase } from './use-case/createProtectUser.use-case';
import { CreateUserUseCase } from './use-case/createUser.use-case';
import { FindAllUsersUseCase } from './use-case/findAllUsers.use-case';
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
import { userMessages } from './user.messages';

@ApiTags('User')
@Controller('user')
export class UserController {
	private readonly logger = new Logger(UserController.name);
	constructor(
		private readonly createUserUseCase: CreateUserUseCase,
		private readonly createProtectUserUseCase: CreateProtectUserUseCase,
		private readonly findAllUsersUseCase: FindAllUsersUseCase,
		private readonly updateUserUseCase: UpdateUserUseCase,
		private readonly getUserProfileUseCase: GetUserProfileUseCase,
		private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
		private readonly updateUserProfileEmailUseCase: UpdateUserProfileEmailUseCase,
		private readonly updateUserProfilePasswordUseCase: UpdateUserProfilePasswordUseCase,
		private readonly unregisterUserUseCase: UnregisterUserUseCase,
		private readonly removeUserUseCase: RemoveUserUseCase,
		private readonly recoveryPasswordUseCase: RecoveryPasswordUseCase,
		private readonly recoveryVerifyPasswordUseCase: RecoveryVerifyPasswordUseCase,
		private readonly setNewPasswordUseCase: SetNewPasswordUseCase,
		private readonly activateAccountUseCase: ActivateAccountUseCase,
	) {}

	@ApiResponse({ status: 201, description: 'Usuario creado', type: User })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@Post()
	create(@Body() data: UserDefaultRegisterDTO) {
		this.logger.log(
			`system - ${data.surnames} ${data.names} - ${userMessages.log.create}`,
		);
		return this.createUserUseCase.execute(data);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userAdd)
	@ApiResponse({ status: 201, description: 'Usuario creado', type: User })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@Post('/protect')
	async createProtect(@Body() data: UserRegisterDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.create}`);

		return this.createProtectUserUseCase.execute({ data, dataLog });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userRead)
	@ApiResponse({
		status: 200,
		description: 'Usuarios encontrados',
		type: [User],
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@Get()
	async findAll(@Query() filter: UserGetAllDTO, @Req() req: ReqUidDTO) {
		const { uid, dataLog } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.findAll}`);

		return this.findAllUsersUseCase.execute({
			filter,
			uidUser: uid,
			dataLog,
		});
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userUpdate)
	@ApiResponse({ status: 200, description: 'Usuario actualizado', type: User })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado' })
	@Patch()
	async update(@Body() data: UserUpdateDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.update}`);

		return this.updateUserUseCase.execute({ data, dataLog });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userProfile)
	@ApiResponse({ status: 200, description: 'Perfil de usuario', type: User })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado' })
	@Get('/profile')
	async profile(@Req() req: ReqUidDTO) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.profile}`);

		return this.getUserProfileUseCase.execute({ uid, dataLog });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userProfile)
	@ApiResponse({
		status: 200,
		description: 'Perfil de usuario actualizado',
		type: User,
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado' })
	@Patch('/profile/data')
	async updateProfile(
		@Body() data: UserUpdateProfileDataDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.updateProfile}`);

		return this.updateUserProfileUseCase.execute({ data, uid, dataLog });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userProfile)
	@ApiResponse({
		status: 200,
		description: 'Correo de perfil de usuario actualizado',
		type: User,
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado' })
	@Patch('/profile/email')
	async updateProfileEmail(
		@Body() data: UserUpdateProfileEmailDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.updateProfileEmail}`);

		return this.updateUserProfileEmailUseCase.execute({
			data,
			uid,
			dataLog,
		});
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userProfile)
	@ApiResponse({
		status: 200,
		description: 'Contraseña de perfil de usuario actualizada',
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado' })
	@Patch('/profile/password')
	async updateProfilePassword(
		@Body() data: UserUpdateProfilePasswordDTO,
		@Req() req: ReqUidDTO,
	) {
		const { uid, dataLog } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.updateProfilePassword}`);

		return this.updateUserProfilePasswordUseCase.execute({
			data,
			uid,
			dataLog,
		});
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userProfile)
	@ApiResponse({ status: 200, description: 'Usuario dado de baja' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado' })
	@Delete('/profile/unregister')
	async unregister(@Req() req: ReqUidDTO) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.unregister}`);

		return this.unregisterUserUseCase.execute({ uid, dataLog });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userDelete)
	@ApiResponse({ status: 200, description: 'Usuario eliminado' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado' })
	@Delete('/delete/:uid')
	async remove(@Param() data: UserDeleteDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.remove}`);

		return this.removeUserUseCase.execute({
			uid: data.uid,
			dataLog,
		});
	}

	@ApiResponse({ status: 200, description: 'Correo de recuperación enviado' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado' })
	@Post('/recoveryPassword')
	async recovery(@Body() data: UserRecoveryPasswordDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.recoveryPassword}`);

		return this.recoveryPasswordUseCase.execute({ email: data.email, dataLog });
	}

	@ApiResponse({
		status: 200,
		description: 'Código de recuperación verificado',
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@Post('/recoveryPassCode')
	async recoveryVerifyPassword(
		@Body() data: RecoveryVerifyPasswordDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.recoveryVerifyPassword}`);

		return this.recoveryVerifyPasswordUseCase.execute({
			code: data.code,
			email: data.email,
			dataLog,
		});
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ApiResponse({ status: 200, description: 'Contraseña actualizada' })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Post('/newPassword')
	async newPassword(@Body() data: UserNewPasswordDTO, @Req() req: ReqUidDTO) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.newPassword}`);

		return this.setNewPasswordUseCase.execute({
			newPassword: data.newPassword,
			confirmPassword: data.confirmPassword,
			uidUser: uid,
			dataLog,
		});
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ApiResponse({ status: 200, description: 'Contraseña actualizada' })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado' })
	@Patch('/updatePassword')
	async newPasswordUpdate(
		@Body() data: UserUpdatePasswordDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.updatePassword}`);

		return this.setNewPasswordUseCase.execute({
			newPassword: data.newPassword,
			confirmPassword: data.confirmPassword,
			uidUser: data.uidUser,
			dataLog,
		});
	}

	@ApiResponse({ status: 200, description: 'Cuenta activada' })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@Post('/activated')
	async activatedAccount(
		@Body() code: UserActivateCountDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${userMessages.log.activatedAccount}`);

		return this.activateAccountUseCase.execute(code);
	}
}
