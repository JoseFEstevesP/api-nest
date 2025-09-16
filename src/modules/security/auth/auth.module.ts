import { EnvironmentVariables } from '@/config/env.config';
import { AuditModule } from '@/modules/security/audit/audit.module';
import { RolModule } from '@/modules/security/rol/rol.module';
import { UserModule } from '@/modules/security/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleLoginUseCase } from './use-case/google-login.use-case';
import { LoginUseCase } from './use-case/login.use-case';
import { LogoutUseCase } from './use-case/logout.use-case';
import { RefreshTokenUseCase } from './use-case/refreshToken.use-case';
import { ValidateGoogleUserUseCase } from './use-case/validate-google-user.use-case';

@Module({
	imports: [
		UserModule,
		PassportModule,
		AuditModule,
		forwardRef(() => RolModule),
		SequelizeModule.forFeature([]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (
				configService: ConfigService<EnvironmentVariables>,
			) => ({
				secret: configService.get('JWT_SECRET'),
				signOptions: { expiresIn: '1h' },
			}),
		}),
	],
	controllers: [AuthController],
	providers: [
		JwtStrategy,
		LoginUseCase,
		LogoutUseCase,
		RefreshTokenUseCase,
		GoogleStrategy,
		GoogleLoginUseCase,
		ValidateGoogleUserUseCase,
	],
	exports: [JwtStrategy, JwtModule],
})
export class AuthModule {}
