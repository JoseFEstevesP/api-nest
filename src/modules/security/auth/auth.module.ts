import { EnvironmentVariables } from '@/config/env.config';
import { AuditModule } from '@/modules/security/audit/audit.module';
import { UserModule } from '@/modules/security/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LoginUseCase } from './use-case/login.use-case';
import { LogoutUseCase } from './use-case/logout.use-case';
import { RefreshTokenUseCase } from './use-case/refreshToken.use-case';

@Module({
	imports: [
		UserModule,
		PassportModule,
		AuditModule,
		SequelizeModule.forFeature([]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (
				configService: ConfigService<EnvironmentVariables>,
			) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: { expiresIn: '1h' },
			}),
		}),
	],
	controllers: [AuthController],
	providers: [JwtStrategy, LoginUseCase, LogoutUseCase, RefreshTokenUseCase],
	exports: [JwtStrategy, JwtModule],
})
export class AuthModule {}
