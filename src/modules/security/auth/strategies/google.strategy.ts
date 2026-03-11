import { EnvironmentVariables } from '@/config/env.config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ValidateGoogleUserUseCase } from '../use-case/validate-google-user.use-case';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(
		private readonly validateGoogleUserUseCase: ValidateGoogleUserUseCase,
		private readonly configService: ConfigService<EnvironmentVariables>,
	) {
		super({
			clientID: configService.get('GOOGLE_CLIENT_ID'),
			clientSecret: configService.get('GOOGLE_SECRET'),
			callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
			scope: ['email', 'profile'],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		return this.validateGoogleUserUseCase.execute(profile);
	}
}
