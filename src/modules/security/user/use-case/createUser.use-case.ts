import { EnvironmentVariables } from '@/config/env.config';
import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { EmailService } from '@/services/email.service';
import { Injectable, Logger } from '@nestjs/common';
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
	private readonly logger = new Logger(CreateUserUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly emailService: EmailService,
		private readonly findOneRolUseCase: FindOneRolUseCase,
		private readonly configService: ConfigService<EnvironmentVariables>,
	) {}

	async execute(data: UserDefaultRegisterDTO): Promise<{ msg: string }> {
		// oxlint-disable-next-line no-unused-vars
		const { confirmPassword, ...userData } = data;
		const { phone, email, password } = userData;

		const whereClause: WhereOptions<User> = {
			[Op.or]: [{ phone }, { email }],
		};
		const existingPatient = await this.userRepository.findOne({
			where: whereClause,
		});

		validatePropertyData({
			property: { phone, email },
			data: existingPatient,
			msg: userMessages,
			checkErrors: checkValidationErrorsUser,
		});

		const code =
			this.configService.get('NODE_ENV') === 'production'
				? `${this.generateCode()}`
				: null;

		if (this.configService.get('NODE_ENV') === 'production') {
			this.logger.log(`system - ${userMessages.log.emailActivated}`);
			this.emailService.activatedAccount({ code, email });
		}

		const hashPass = await hash(
			password,
			this.configService.get('SALT_ROUNDS'),
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
		this.logger.log(`${userMessages.log.createSuccess}`);

		return { msg: userMessages.msg.registerDefault };
	}

	private generateCode() {
		return Math.floor(Math.random() * 9000000) + 1000000;
	}
}
