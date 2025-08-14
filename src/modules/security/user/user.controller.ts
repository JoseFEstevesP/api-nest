import { JwtAuthGuard } from '@/modules/security/auth/guards/jwt-auth.guard';
import { Permission } from '@/modules/security/rol/enum/permissions';
import { ValidPermission } from '@/modules/security/valid-permission/valid-permission.decorator';
import { PermissionsGuard } from '@/modules/security/valid-permission/valid-permission.guard';
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqUidDTO } from '../../../dto/ReqUid.dto';
import { UserActivateCountDTO } from './dto/UserActivateCount.dto';
import { UserDeleteDTO } from './dto/UserDelete.dto';
import { UserNewPasswordDTO } from './dto/UserNewPassword.dto';
import { UserRecoveryPasswordDTO } from './dto/UserRecoveryPassword.dto';
import { UserUpdateDTO } from './dto/UserUpdate.dto';
import { UserUpdatePasswordDTO } from './dto/UserUpdatePassword.dto';
import { UserUpdateProfileDataDTO } from './dto/UserUpdateProfileData.dto';
import { UserUpdateProfileEmailDTO } from './dto/UserUpdateProfileEmail.dto';
import { UserUpdateProfilePasswordDTO } from './dto/UserUpdateProfilePassword.dto';
import { UserDefaultRegisterDTO } from './dto/userDefaultRegister.dto';
import { UserGetAllDTO } from './dto/userGetAll.dto';
import { UserRegisterDTO } from './dto/userRegister.dto';
import { msg } from './msg';
import { ActivateAccountUseCase } from './use-case/activateAccount';
import { CreateProtectUserUseCase } from './use-case/createProtectUser';
import { CreateUserUseCase } from './use-case/createUser';
import { FindAllUsersUseCase } from './use-case/findAllUsers';
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

	@Post()
	create(@Body() data: UserDefaultRegisterDTO) {
		this.logger.log(
			`system - ${data.ci} - ${data.first_surname} ${data.first_name} - ${msg.log.create}`,
		);
		return this.createUserUseCase.execute(data);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userAdd)
	@Post('/protect')
	async createProtect(@Body() data: UserRegisterDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.create}`);

		return this.createProtectUserUseCase.execute({ data, dataLog });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userRead)
	@Get()
	async findAll(@Query() filter: UserGetAllDTO, @Req() req: ReqUidDTO) {
		const { uid, dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.findAll}`);

		return this.findAllUsersUseCase.execute({
			filter,
			uidUser: uid,
			dataLog,
		});
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userUpdate)
	@Patch()
	async update(@Body() data: UserUpdateDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.update}`);

		return this.updateUserUseCase.execute({ data, dataLog });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userProfile)
	@Get('/profile')
	async profile(@Req() req: ReqUidDTO) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.profile}`);

		return this.getUserProfileUseCase.execute({ uid, dataLog });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userProfile)
	@Patch('/profile/data')
	async updateProfile(
		@Body() data: UserUpdateProfileDataDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.updateProfile}`);

		return this.updateUserProfileUseCase.execute({ data, uid, dataLog });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userProfile)
	@Patch('/profile/email')
	async updateProfileEmail(
		@Body() data: UserUpdateProfileEmailDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.updateProfileEmail}`);

		return this.updateUserProfileEmailUseCase.execute({
			data,
			uid,
			dataLog,
		});
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userProfile)
	@Patch('/profile/password')
	async updateProfilePassword(
		@Body() data: UserUpdateProfilePasswordDTO,
		@Req() req: ReqUidDTO,
	) {
		const { uid, dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.updateProfilePassword}`);

		return this.updateUserProfilePasswordUseCase.execute({
			data,
			uid,
			dataLog,
		});
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userProfile)
	@Delete('/profile/unregister')
	async unregister(@Req() req: ReqUidDTO) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.unregister}`);

		return this.unregisterUserUseCase.execute({ uid, dataLog });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userDelete)
	@Delete('/delete/:uid')
	async remove(@Param() data: UserDeleteDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.remove}`);

		return this.removeUserUseCase.execute({
			uid: data.uid,
			dataLog,
		});
	}

	@Post('/recoveryPassword')
	async recovery(@Body() data: UserRecoveryPasswordDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.recoveryPassword}`);

		return this.recoveryPasswordUseCase.execute({ email: data.email, dataLog });
	}

	@Post('/recoveryPassCode')
	async recoveryVerifyPassword(
		@Body() data: { code: string; email: string },
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.recoveryVerifyPassword}`);

		return this.recoveryVerifyPasswordUseCase.execute({
			code: data.code,
			email: data.email,
			dataLog,
		});
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@Post('/newPassword')
	async newPassword(@Body() data: UserNewPasswordDTO, @Req() req: ReqUidDTO) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.newPassword}`);

		return this.setNewPasswordUseCase.execute({
			newPassword: data.newPassword,
			confirmPassword: data.confirmPassword,
			uidUser: uid,
			dataLog,
		});
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@Patch('/updatePassword')
	async newPasswordUpdate(
		@Body() data: UserUpdatePasswordDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.updatePassword}`);

		return this.setNewPasswordUseCase.execute({
			newPassword: data.newPassword,
			confirmPassword: data.confirmPassword,
			uidUser: data.uidUser,
			dataLog,
		});
	}

	@Post('/activated')
	async activatedAccount(
		@Body() code: UserActivateCountDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.activatedAccount}`);

		return this.activateAccountUseCase.execute(code);
	}
}
