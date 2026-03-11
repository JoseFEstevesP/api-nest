import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { dataInfoJWT } from '@/functions/dataInfoJWT';
import { User } from '@/modules/security/user/entities/user.entity';
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { authMessages } from './auth.messages';
import { AuthLoginDTO } from './dto/authLogin.dto';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { GoogleLoginUseCase } from './use-case/google-login.use-case';
import { LoginUseCase } from './use-case/login.use-case';
import { LogoutUseCase } from './use-case/logout.use-case';
import { RefreshTokenUseCase } from './use-case/refreshToken.use-case';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name);

	constructor(
		private readonly loginUseCase: LoginUseCase,
		private readonly logoutUseCase: LogoutUseCase,
		private readonly refreshTokenUseCase: RefreshTokenUseCase,
		private readonly googleLoginUseCase: GoogleLoginUseCase,
		private readonly configService: ConfigService,
	) {}

	@ApiResponse({ status: 201, description: 'Usuario logueado' })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@HttpCode(HttpStatus.CREATED)
	@Post('/login')
	async login(
		@Body() data: AuthLoginDTO,
		@Res({ passthrough: true }) res: Response,
		@Req() req: Request & ReqUidDTO,
	) {
		this.logger.log(`system - ${authMessages.log.login}`);
		await this.loginUseCase.execute({ data, res, loginInfo: dataInfoJWT(req) });
		return { msg: authMessages.msg.loginSuccess }; // Return response instead of manually sending it
	}

	@ApiResponse({ status: 200, description: 'Usuario deslogueado' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post('/logout')
	async logout(
		@Res({ passthrough: true }) res: Response,
		@Req() req: ReqUidDTO,
	) {
		const { uid, dataLog } = req.user;
		this.logger.log(`${dataLog} - ${authMessages.log.logout}`);
		await this.logoutUseCase.execute({ uid, res, dataLog });
		return { msg: 'Sesión cerrada exitosamente' };
	}

	@ApiResponse({ status: 201, description: 'Token refrescado' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@HttpCode(HttpStatus.CREATED)
	@Post('/refresh-token')
	async refreshToken(
		@Req() req: Request & ReqUidDTO,
		@Res({ passthrough: true }) res: Response,
	) {
		await this.refreshTokenUseCase.execute({
			req,
			res,
			loginInfo: dataInfoJWT(req),
		});
		return { msg: 'Token actualizado' }; // Return response instead of manually sending it
	}

	@Get('google')
	async googleLogin() {
		const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
		if (!clientId) {
			return { msg: 'Google OAuth not configured' };
		}
	}

	@Get('google/callback')
	async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
		const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
		if (!clientId) {
			return { msg: 'Google OAuth not configured' };
		}
		this.googleLoginUseCase.execute({
			user: req.user as User,
			res,
			loginInfo: dataInfoJWT(req),
		});
	}
}
