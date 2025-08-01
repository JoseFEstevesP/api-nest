import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { dataInfoJWT } from '@/functions/dataInfoJWT';
import {
	Body,
	Controller,
	Logger,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthLoginDTO } from './dto/authLogin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { msg } from './msg';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name);

	constructor(private readonly authService: AuthService) {}

	@Post('/login')
	async login(
		@Body() data: AuthLoginDTO,
		@Res({ passthrough: true }) res: Response,
		@Req() req: Request & ReqUidDTO,
	) {
		this.logger.log(`system - ${msg.log.login}`);
		await this.authService.login({ data, res, loginInfo: dataInfoJWT(req) });
	}

	@UseGuards(JwtAuthGuard)
	@Post('/logout')
	logout(@Res() res: Response, @Req() req: ReqUidDTO) {
		const { uid, dataLog } = req.user;
		this.logger.log(`${dataLog} - ${msg.log.logout}`);
		return this.authService.logout({ uid, res, dataLog });
	}

	@Post('/refresh-token')
	async refreshToken(@Req() req: Request & ReqUidDTO, @Res() res: Response) {
		return this.authService.refreshToken({
			req,
			res,
			loginInfo: dataInfoJWT(req),
		});
	}
}
