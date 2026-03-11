import { EnvironmentVariables } from '@/config/env.config';
import { FindOneRolUseCase } from '@/modules/security/rol/use-case/findOneRol.use-case';
import { User } from '@/modules/security/user/entities/user.entity';
import { UserRepository } from '@/modules/security/user/repository/user.repository';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';

@Injectable()
export class ValidateGoogleUserUseCase {
	private readonly logger = new Logger(ValidateGoogleUserUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly findOneRolUseCase: FindOneRolUseCase,
		private readonly configService: ConfigService<EnvironmentVariables>,
	) {}

	async execute(profile: Profile): Promise<User> {
		const email = profile.emails[0].value;
		const user = await this.userRepository.findOne({ where: { email } });

		if (user) {
			if (user.provider !== 'google') {
				this.logger.error(
					`El usuario con el correo ${email} ya existe con otro proveedor.`,
				);
				throw new ConflictException(
					'Este correo ya está registrado con otro método de autenticación.',
				);
			}
			return user;
		}

		const { uid: uidRol } = await this.findOneRolUseCase.execute({
			typeRol: this.configService.get('DEFAULT_ROL_FROM_USER'),
		});

		const newUser = {
			names: profile.name.givenName,
			surnames: profile.name.familyName,
			email,
			password: null,
			provider: 'google',
			phone: '0000000000',
			uidRol,
			activatedAccount: true,
		} as User;

		this.logger.log(`Creando nuevo usuario de Google: ${email}`);
		return this.userRepository.create(newUser);
	}
}
