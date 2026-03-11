import { EnvironmentVariables } from '@/config/env.config';
import { DataInfoJWT } from '@/functions/dataInfoJWT.d';
import { FindOneAuditUseCase } from '@/modules/security/audit/use-case/findOneAudit.use-case';
import { UpdateAuditUseCase } from '@/modules/security/audit/use-case/updateAudit.use-case';
import { User } from '@/modules/security/user/entities/user.entity';
import { FindOneUserUseCase } from '@/modules/security/user/use-case/findOneUser.use-case';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { authMessages } from '../auth.messages';
import { LogoutUseCase } from './logout.use-case';

@Injectable()
export class RefreshTokenUseCase {
	private readonly logger = new Logger(RefreshTokenUseCase.name);
	constructor(
		private readonly findOneAuditUseCase: FindOneAuditUseCase,
		private readonly updateAuditUseCase: UpdateAuditUseCase,
		private readonly findOneUserUseCase: FindOneUserUseCase,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<EnvironmentVariables>,
		private readonly logoutUseCase: LogoutUseCase,
	) {}

	async execute({
		req,
		res,
		loginInfo,
	}: {
		req: Request;
		res: Response;
		loginInfo: DataInfoJWT;
	}) {
		const refreshToken = req.cookies?.refreshToken;

		if (!refreshToken) {
			this.logger.error(`system - ${authMessages.log.refreshToken}`);
			throw new UnauthorizedException(authMessages.msg.refreshToken);
		}

		const loginInfoArray = Object.keys(loginInfo).map(key => loginInfo[key]);
		const auditRef = await this.findOneAuditUseCase.execute({
			refreshToken,
			dataToken: loginInfoArray,
		});

		if (!auditRef) {
			this.logger.error(authMessages.log.userError);
			return this.logoutUseCase.execute({
				refreshToken,
				res,
				dataLog: 'system',
			});
		}

		const user = await this.findOneUserUseCase.execute({
			uid: auditRef.uidUser,
		});

		if (refreshToken !== auditRef.refreshToken) {
			this.logger.error(`system ${authMessages.log.refreshTokenUser}`);
			return this.logoutUseCase.execute({
				uid: auditRef.uid,
				res,
				dataLog: 'system',
			});
		}

		const newAccessToken = await this.generateAccessToken(user, loginInfo);
		const newRefreshToken = await this.generateRefreshToken(user, loginInfo);

		await this.updateAuditUseCase.execute({
			data: { uid: auditRef.uid, refreshToken: newRefreshToken },
		});

		this.setCookies(res, newAccessToken, newRefreshToken);
		// Response will be handled by the controller
	}

	private setCookies(res: Response, accessToken: string, refreshToken: string) {
		const isProduction = this.configService.get('NODE_ENV') === 'production';
		const sameSite = isProduction ? 'none' : 'lax';

		res
			.cookie('accessToken', accessToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite,
				maxAge: 3600 * 1000,
			})
			.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite,
				maxAge: 7 * 24 * 3600 * 1000,
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
			secret: process.env.JWT_SECRET,
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
