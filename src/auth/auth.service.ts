import { AuditService } from '@/audit/audit.service';
import { EnvironmentVariables } from '@/config/env.config';
import { DataInfoJWT } from '@/functions/dataInfoJWT.d';
import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { Request, Response } from 'express';
import { msg } from './msg';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly auditService: AuditService,
		private configService: ConfigService<EnvironmentVariables>,
	) {}

	async login({
		data,
		res,
		loginInfo,
	}: {
		data: { ci: string; password: string };
		res: Response;
		loginInfo: DataInfoJWT;
	}) {
		const { ci, password } = data;
		const user = await this.userService.findUserForAuth(ci);

		if (!user) throwHttpExceptionUnique(msg.msg.userError);

		const checkPassword = await compare(password, user.password);
		if (!checkPassword) {
			this.logger.error(`system - ${msg.log.loginPassword}`);
			await this.userService.validateAttempt({ user });
			throwHttpExceptionUnique(msg.msg.credential);
		}

		const accessToken = await this.generateAccessToken(user, loginInfo);
		const refreshToken = await this.generateRefreshToken(user, loginInfo);

		await user.update({ attemptCount: 0 });

		const loginInfoArray = Object.keys(loginInfo).map(key => loginInfo[key]);
		try {
			await this.auditService.create({
				data: {
					uid: crypto.randomUUID(),
					uidUser: user.uid,
					refreshToken,
					dataToken: loginInfoArray,
				},
			});

			this.setCookies(res, accessToken, refreshToken);
			res.json({ msg: msg.msg.loginSuccess });
		} catch (error) {
			this.logger.error(msg.log.sessionExisting, error);
			throwHttpExceptionUnique(msg.log.sessionExisting);
		}

		this.logger.log(
			`${user.ci} - ${user.first_surname} ${user.first_name} - ${msg.log.loginSuccess}`,
		);
	}

	async logout({
		uid,
		res,
		dataLog,
	}: {
		uid: string;
		res: Response;
		dataLog: string;
	}) {
		const user = await this.userService.findUserById(uid);

		if (!user) {
			this.logger.error(msg.log.userError);
			throwHttpExceptionUnique(msg.msg.findOne);
		}

		await this.auditService.remove({ uidUser: user.uid }, dataLog);

		res
			.clearCookie('accessToken')
			.clearCookie('refreshToken')
			.json({ msg: msg.msg.logout });
	}

	async refreshToken({
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
			this.logger.error(`system - ${msg.log.refreshToken}`);
			throwHttpExceptionUnique(msg.msg.refreshToken);
		}

		const loginInfoArray = Object.keys(loginInfo).map(key => loginInfo[key]);
		const auditRef = await this.auditService.findOne({
			refreshToken,
			dataToken: loginInfoArray,
		});

		if (!auditRef) {
			this.logger.error(msg.log.userError);
			return this.logout({ uid: auditRef.uid, res, dataLog: 'system' });
		}

		const user = await this.userService.findUserById(auditRef.uidUser);

		if (refreshToken !== auditRef.refreshToken) {
			this.logger.error(`system ${msg.log.refreshTokenUser}`);
			return this.logout({ uid: auditRef.uid, res, dataLog: 'system' });
		}

		const newAccessToken = await this.generateAccessToken(user, loginInfo);
		const newRefreshToken = await this.generateRefreshToken(user, loginInfo);

		await auditRef.update({ refreshToken: newRefreshToken });

		this.setCookies(res, newAccessToken, newRefreshToken);
		res.json({ msg: 'Token actualizado' });
	}

	private setCookies(res: Response, accessToken: string, refreshToken: string) {
		const isProduction =
			this.configService.get<string>('NODE_ENV') === 'production';
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
			dataLog: `${user.ci} - ${user.first_surname} ${user.first_name}`,
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
			secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
		});
	}
}
