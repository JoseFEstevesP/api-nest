import { EnvironmentVariables } from '@/config/env.config';
import { DataInfoJWT } from '@/functions/dataInfoJWT.d';
import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { CreateAuditUseCase } from '@/modules/security/audit/use-case/createAudit.use-case';
import { User } from '@/modules/security/user/entities/user.entity';
import { FindUserForAuthUseCase } from '@/modules/security/user/use-case/findUserById.use-case';
import { ValidateAttemptUseCase } from '@/modules/security/user/use-case/validateAttempt.use-case';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { Response } from 'express';
import { msg } from '../msg';
import { AuthLoginDTO } from '../dto/authLogin.dto';

@Injectable()
export class LoginUseCase {
	private readonly logger = new Logger(LoginUseCase.name);
	constructor(
		private readonly findUserForAuthUseCase: FindUserForAuthUseCase,
		private readonly validateAttemptUseCase: ValidateAttemptUseCase,
		private readonly jwtService: JwtService,
		private readonly createAuditUseCase: CreateAuditUseCase,
		private configService: ConfigService<EnvironmentVariables>,
	) {}

	async execute({
		data,
		res,
		loginInfo,
	}: {
		data: AuthLoginDTO;
		res: Response;
		loginInfo: DataInfoJWT;
	}) {
		const { email, password } = data;
		const user = await this.findUserForAuthUseCase.execute(email);

		if (!user) throwHttpExceptionUnique(msg.msg.userError);

		const checkPassword = await compare(password, user.password);
		if (!checkPassword) {
			this.logger.error(`system - ${msg.log.loginPassword}`);
			await this.validateAttemptUseCase.execute({ user });
			throwHttpExceptionUnique(msg.msg.credential);
		}

		const accessToken = await this.generateAccessToken(user, loginInfo);
		const refreshToken = await this.generateRefreshToken(user, loginInfo);

		await user.update({ attemptCount: 0 });

		const loginInfoArray = Object.keys(loginInfo).map(key => loginInfo[key]);
		try {
			await this.createAuditUseCase.execute({
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
			`${user.first_surname} ${user.first_name} - ${msg.log.loginSuccess}`,
		);
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
			dataLog: `${user.first_surname} ${user.first_name}`,
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
