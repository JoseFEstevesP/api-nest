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
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleLoginUseCase } from './use-case/google-login.use-case';
import { LoginUseCase } from './use-case/login.use-case';
import { LogoutUseCase } from './use-case/logout.use-case';
import { RefreshTokenUseCase } from './use-case/refreshToken.use-case';
import { ValidateGoogleUserUseCase } from './use-case/validate-google-user.use-case';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
	imports: [
		UserModule,
		PassportModule.register({ defaultStrategy: 'jwt' }),
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
		GoogleLoginUseCase,
		ValidateGoogleUserUseCase,
		{
			provide: 'GOOGLE_STRATEGY',
			useFactory: async (
				validateGoogleUserUseCase: ValidateGoogleUserUseCase,
				configService: ConfigService<EnvironmentVariables>,
			) => {
				const clientId = configService.get<string>('GOOGLE_CLIENT_ID', {
					infer: true,
				});
				const clientSecret = configService.get<string>('GOOGLE_SECRET', {
					infer: true,
				});

				if (clientId && clientSecret) {
					return new GoogleStrategy(validateGoogleUserUseCase, configService);
				}
				return null;
			},
			inject: [ValidateGoogleUserUseCase, ConfigService],
		},
	],
	exports: [JwtStrategy, JwtModule],
})
export class AuthModule {}
