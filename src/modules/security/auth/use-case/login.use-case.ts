import { EnvironmentVariables } from '@/config/env.config';
import { DataInfoJWT } from '@/functions/dataInfoJWT.d';
import { CreateAuditUseCase } from '@/modules/security/audit/use-case/createAudit.use-case';
import { User } from '@/modules/security/user/entities/user.entity';
import { UserRepository } from '@/modules/security/user/repository/user.repository';
import { FindUserForAuthUseCase } from '@/modules/security/user/use-case/findUserById.use-case';
import { ValidateAttemptUseCase } from '@/modules/security/user/use-case/validateAttempt.use-case';
import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { Response } from 'express';
import { Transaction } from 'sequelize';
import { authMessages } from '../auth.messages';
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
		private readonly userRepository: UserRepository,
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

		if (!user) throw new NotFoundException(authMessages.msg.userError);

		const checkPassword = await compare(password, user.password);
		if (!checkPassword) {
			this.logger.error(`system - ${authMessages.log.loginPassword}`);
			await this.validateAttemptUseCase.execute({ user });
			throw new UnauthorizedException(authMessages.msg.credential);
		}

		const accessToken = await this.generateAccessToken(user, loginInfo);
		const refreshToken = await this.generateRefreshToken(user, loginInfo);

		const loginInfoArray = Object.keys(loginInfo).map(key => loginInfo[key]);

		try {
			await this.userRepository.transaction(async (t: Transaction) => {
				await user.update({ attemptCount: 0 }, { transaction: t });

				await this.createAuditUseCase.execute(
					{
						data: {
							uid: crypto.randomUUID(),
							uidUser: user.uid,
							refreshToken,
							dataToken: loginInfoArray,
						},
					},
					t,
				);
			});

			this.setCookies(res, accessToken, refreshToken);
			res.json({ msg: authMessages.msg.loginSuccess });
		} catch (error) {
			this.logger.error(authMessages.log.sessionExisting, error);
			throw new ConflictException(authMessages.log.sessionExisting);
		}

		this.logger.log(
			`${user.surnames} ${user.names} - ${authMessages.log.loginSuccess}`,
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
			secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
		});
	}
}
