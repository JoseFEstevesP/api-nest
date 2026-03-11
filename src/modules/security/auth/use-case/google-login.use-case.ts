import { EnvironmentVariables } from '@/config/env.config';
import { DataInfoJWT } from '@/functions/dataInfoJWT.d';
import { CreateAuditUseCase } from '@/modules/security/audit/use-case/createAudit.use-case';
import { User } from '@/modules/security/user/entities/user.entity';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { authMessages } from '../auth.messages';

@Injectable()
export class GoogleLoginUseCase {
	private readonly logger = new Logger(GoogleLoginUseCase.name);
	constructor(
		private readonly jwtService: JwtService,
		private readonly createAuditUseCase: CreateAuditUseCase,
		private readonly configService: ConfigService<EnvironmentVariables>,
	) {}

	async execute({
		user,
		res,
		loginInfo,
	}: {
		user: User;
		res: Response;
		loginInfo: DataInfoJWT;
	}) {
		const accessToken = await this.generateAccessToken(user, loginInfo);
		const refreshToken = await this.generateRefreshToken(user, loginInfo);

		const loginInfoArray = Object.keys(loginInfo).map(key => loginInfo[key]);

		await this.createAuditUseCase.execute({
			data: {
				uidUser: user.uid,
				refreshToken,
				dataToken: loginInfoArray,
			},
		});

		this.setCookies(res, accessToken, refreshToken);
		this.logger.log(
			`${user.surnames} ${user.names} - ${authMessages.log.loginSuccess}`,
		);
		res.redirect(this.configService.get('FRONT_END_URL'));
	}

	private setCookies(res: Response, accessToken: string, refreshToken: string) {
		const isProduction = this.configService.get('NODE_ENV') === 'production';
		const sameSite = isProduction ? 'none' : 'lax';

		res
			.cookie('accessToken', accessToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite,
				maxAge: 3600 * 1000, // 1 hora
			})
			.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite,
				maxAge: 7 * 24 * 3600 * 1000, // 7 días
			});
	}

	private async generateAccessToken(user: User, loginInfo: DataInfoJWT) {
		const dataToken = {
			uid: user.uid,
			uidRol: user.uidRol,
			dataLog: `${user.surnames} ${user.names}`,
			...loginInfo,
		};

		return this.jwtService.signAsync(dataToken, {
			expiresIn: '1h',
			secret: this.configService.get('JWT_SECRET'),
		});
	}

	private async generateRefreshToken(user: User, loginInfo: DataInfoJWT) {
		const dataToken = {
			uid: user.uid,
			...loginInfo,
		};

		return this.jwtService.signAsync(dataToken, {
			expiresIn: '7d',
			secret: this.configService.get('JWT_REFRESH_SECRET'),
		});
	}
}
