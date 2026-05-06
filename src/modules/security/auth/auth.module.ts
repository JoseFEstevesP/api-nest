import { EnvironmentVariables } from '@/config/env.config';
import { AuditModule } from '@/modules/security/audit/audit.module';
import { RolModule } from '@/modules/security/rol/rol.module';
import { UserModule } from '@/modules/security/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggerService } from '@/services/logger.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LoginUseCase } from './use-case/login.use-case';
import { LogoutUseCase } from './use-case/logout.use-case';
import { RefreshTokenUseCase } from './use-case/refreshToken.use-case';
import { CheckSessionUseCase } from './use-case/checkSession.use-case';

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
		LoggerService,
		JwtStrategy,
		LoginUseCase,
		LogoutUseCase,
		RefreshTokenUseCase,
		CheckSessionUseCase,
	],
	exports: [JwtStrategy, JwtModule, LoggerService],
})
export class AuthModule {}
