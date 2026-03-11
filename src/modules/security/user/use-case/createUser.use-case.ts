import { EnvironmentVariables } from '@/config/env.config';
import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { EmailService } from '@/services/email.service';
import { LoggerService } from '@/services/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';
import { Op, WhereOptions } from 'sequelize';
import { FindOneRolUseCase } from '../../rol/use-case/findOneRol.use-case';
import { UserDefaultRegisterDTO } from '../dto/userDefaultRegister.dto';
import { User } from '../entities/user.entity';
import { checkValidationErrorsUser } from '../functions/checkValidationErrorsUser';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class CreateUserUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly emailService: EmailService,
		private readonly findOneRolUseCase: FindOneRolUseCase,
		private readonly configService: ConfigService<EnvironmentVariables>,
		private readonly logger: LoggerService,
	) {}

	async execute(data: UserDefaultRegisterDTO): Promise<{ msg: string }> {
		const { confirmPassword, ...userData } = data;
		const { phone, email, password } = userData;

		this.logger.debug(`Creando usuario con email: ${email}`, {
			type: 'create_user',
			email,
		});

		const whereClause: WhereOptions<User> = {
			[Op.or]: [{ phone }, { email }],
		};
		const existingPatient = await this.userRepository.findOne({
			where: whereClause,
		});

		validatePropertyData({
			property: { phone, email },
			data:
				(existingPatient as unknown as Record<string, unknown>) ?? undefined,
			msg: userMessages,
			checkErrors: checkValidationErrorsUser,
		});

		const code =
			this.configService.get('NODE_ENV') === 'production'
				? `${this.generateCode()}`
				: '0000000';

		if (this.configService.get('NODE_ENV') === 'production') {
			this.logger.info(userMessages.log.emailActivated, {
				type: 'create_user',
				email,
				action: 'enviar_email_activacion',
			});
			this.emailService.activatedAccount({ code, email });
		}

		const hashPass = await hash(
			password,
			this.configService.get<number>('SALT_ROUNDS', { infer: true }) ?? 10,
		);

		const { uid: uidRol } = await this.findOneRolUseCase.execute({
			typeRol: this.configService.get('DEFAULT_ROL_FROM_USER'),
		});

		const activatedAccount =
			this.configService.get('NODE_ENV') !== 'production';

		const user = {
			...userData,
			password: hashPass,
			activatedAccount,
			code,
			uidRol,
		} as User;

		await this.userRepository.create(user);

		this.logger.info(userMessages.log.createSuccess, {
			type: 'create_user',
			userId: user.uid,
			email,
		});

		this.logger.logMetric('usuario.creado', 1, { email });

		return { msg: userMessages.msg.registerDefault };
	}

	private generateCode() {
		return Math.floor(Math.random() * 9000000) + 1000000;
	}
}
