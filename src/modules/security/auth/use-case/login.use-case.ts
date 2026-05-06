import { Environment, EnvironmentVariables } from '@/config/env.config';
import { ExtendedConflictException } from '@/exceptions/extended-conflict.exception';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { ExtendedUnauthorizedException } from '@/exceptions/extended-unauthorized.exception';
import { DataInfoJWT } from '@/functions/dataInfoJWT.d';
import { objectError } from '@/functions/objectError';
import { CreateAuditUseCase } from '@/modules/security/audit/use-case/createAudit.use-case';
import { User } from '@/modules/security/user/entities/user.entity';
import { UserRepository } from '@/modules/security/user/repository/user.repository';
import { FindUserForAuthUseCase } from '@/modules/security/user/use-case/findUserById.use-case';
import { ValidateAttemptUseCase } from '@/modules/security/user/use-case/validateAttempt.use-case';
import { LoggerService } from '@/services/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { Response } from 'express';
import { Transaction } from 'sequelize';
import { authMessages } from '../auth.messages';
import { AuthLoginDTO } from '../dto/authLogin.dto';

@Injectable()
export class LoginUseCase {
	constructor(
		private readonly findUserForAuthUseCase: FindUserForAuthUseCase,
		private readonly validateAttemptUseCase: ValidateAttemptUseCase,
		private readonly jwtService: JwtService,
		private readonly createAuditUseCase: CreateAuditUseCase,
		private readonly configService: ConfigService<EnvironmentVariables>,
		private readonly userRepository: UserRepository,
		private readonly logger: LoggerService,
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

		if (!user) {
			this.logger.warn('Login fallido - usuario no encontrado', {
				type: 'auth_login',
				email,
				status: 'failed',
			});
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: authMessages.msg.credential }),
			);
		}

		const checkPassword = await compare(password, user.password);
		if (!checkPassword) {
			this.logger.warn('Login fallido - contraseña inválida', {
				type: 'auth_login',
				userId: user.uid,
				email,
				status: 'failed',
			});
			await this.validateAttemptUseCase.execute({ user });
			throw new ExtendedUnauthorizedException(
				objectError({ name: 'all', msg: authMessages.msg.credential }),
			);
		}

		const accessToken = await this.generateAccessToken(user, loginInfo);
		const refreshToken = await this.generateRefreshToken(user, loginInfo);

		const loginInfoArray = Object.values(loginInfo);

		try {
			await this.userRepository.transaction(async (t: Transaction) => {
				await user.update({ attemptCount: 0 }, { transaction: t });

				const formaData = {
					uidUser: user.uid,
					refreshToken,
					dataToken: loginInfoArray,
				};

				await this.createAuditUseCase.execute(
					{
						data: formaData,
					},
					t,
				);
			});

			this.setCookies(res, accessToken, refreshToken);
		} catch (error) {
			this.logger.error(authMessages.log.sessionExisting, 'LoginUseCase', {
				type: 'auth_login',
				userId: user.uid,
				email,
				error: error instanceof Error ? error.message : 'Unknown error',
			});
			throw new ExtendedConflictException(
				objectError({ name: 'all', msg: authMessages.log.sessionExisting }),
			);
		}

		this.logger.info(
			`${user.surnames} ${user.names} - ${authMessages.log.loginSuccess}`,
			{
				type: 'auth_login',
				userId: user.uid,
				email,
				status: 'success',
			},
		);

		this.logger.logMetric('auth.login.exitoso', 1, { email });
	}

	private setCookies(res: Response, accessToken: string, refreshToken: string) {
		const isProduction = this.configService.get('NODE_ENV') === Environment.Production;

		res
			.cookie('accessToken', accessToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? 'none' : 'lax',
				maxAge: 3600 * 1000,
			})
			.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? 'none' : 'lax',
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
