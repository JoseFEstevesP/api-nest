import { AuditModule } from '@/audit/audit.module';
import { EnvironmentVariables } from '@/config/env.config';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
	imports: [
		UserModule,
		PassportModule,
		AuditModule,
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
	providers: [AuthService, JwtStrategy],
	exports: [AuthService, JwtStrategy, JwtModule],
})
export class AuthModule {}
