import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { dataInfoJWT } from '@/functions/dataInfoJWT';
import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Logger,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthLoginDTO } from './dto/authLogin.dto';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { authMessages } from './auth.messages';
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
	}

	@ApiResponse({ status: 200, description: 'Usuario deslogueado' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post('/logout')
	logout(@Res() res: Response, @Req() req: ReqUidDTO) {
		const { uid, dataLog } = req.user;
		this.logger.log(`${dataLog} - ${authMessages.log.logout}`);
		return this.logoutUseCase.execute({ uid, res, dataLog });
	}

	@ApiResponse({ status: 201, description: 'Token refrescado' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@HttpCode(HttpStatus.CREATED)
	@Post('/refresh-token')
	async refreshToken(@Req() req: Request & ReqUidDTO, @Res() res: Response) {
		return this.refreshTokenUseCase.execute({
			req,
			res,
			loginInfo: dataInfoJWT(req),
		});
	}
}
