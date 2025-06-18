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
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
	private readonly logger = new Logger(UserController.name);
	constructor(private readonly userService: UserService) {}

	@Post()
	create(@Body() data: UserDefaultRegisterDTO) {
		this.logger.log(
			`system - ${data.ci} - ${data.first_surname} ${data.first_name} - ${msg.log.create}`,
		);
		return this.userService.create({ data });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userAdd)
	@Post('/protect')
	async createProtect(@Body() data: UserRegisterDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.create}`);

		return this.userService.createProtect({ data, dataLog });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userRead)
	@Get()
	async findAll(@Query() filter: UserGetAllDTO, @Req() req: ReqUidDTO) {
		const { uid, dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.findAll}`);

		return this.userService.findAll({
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

		return this.userService.update({ data, dataLog });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userProfile)
	@Get('/profile')
	async profile(@Req() req: ReqUidDTO) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.profile}`);

		return this.userService.profile({ uid, dataLog });
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

		return this.userService.updateProfile({ data, uid, dataLog });
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

		return this.userService.updateProfileEmail({
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

		return this.userService.updateProfilePassword({
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

		return this.userService.unregister({ uid, dataLog });
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@ValidPermission(Permission.userDelete)
	@Delete('/delete/:uid')
	async remove(@Param() data: UserDeleteDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.remove}`);

		return this.userService.remove({
			uid: data.uid,
			dataLog,
		});
	}

	@Post('/recoveryPassword')
	async recovery(@Body() data: UserRecoveryPasswordDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.recoveryPassword}`);

		return this.userService.recoveryPassword({ email: data.email, dataLog });
	}

	@Post('/recoveryPassCode')
	async recoveryVerifyPassword(
		@Body() data: { code: string; email: string },
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.recoveryVerifyPassword}`);

		return this.userService.recoveryVerifyPassword({
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

		return this.userService.newPassword({
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

		return this.userService.newPassword({
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

		return this.userService.activatedAccount(code);
	}
}
