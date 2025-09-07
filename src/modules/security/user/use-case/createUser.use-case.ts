import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { EmailService } from '@/services/email.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';
import { Op } from 'sequelize';
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
		private readonly configService: ConfigService,
	) {}

	async execute(data: UserDefaultRegisterDTO): Promise<{ msg: string }> {
		// oxlint-disable-next-line no-unused-vars
		const { confirmPassword, ...userData } = data;
		const { uid, phone, email, password } = userData;

		const whereClause = {
			[Op.or]: [{ uid }, { phone }, { email }],
		};
		const existingPatient = await this.userRepository.findOne({
			where: whereClause,
		});

		validatePropertyData({
			property: { uid, phone, email },
			data: existingPatient,
			msg: userMessages,
			checkErrors: checkValidationErrorsUser,
		});

		const code = `${this.generateCode()}`;

		if (this.configService.get<string>('NODE_ENV') === 'production') {
			this.logger.log(`system - ${userMessages.log.emailActivated}`);
			this.emailService.activatedAccount({ code, email });
		}

		const hashPass = await hash(
			password,
			this.configService.get<number>('SALT_ROUNDS'),
		);

		const { uid: uidRol } = await this.findOneRolUseCase.execute({
			typeRol: this.configService.get<string>('DEFAULT_ROL_FROM_USER'),
		});

		const user = {
			...userData,
			password: hashPass,
			activatedAccount: true,
			code: null,
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
