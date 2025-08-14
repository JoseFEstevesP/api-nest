import { throwHttpExceptionProperties } from '@/functions/throwHttpException';
import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { EmailService } from '@/services/email.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';
import { Op } from 'sequelize';
import { FindOneRolUseCase } from '../../rol/use-case/findOneRol.use-case';
import { salt } from '../constants/sal';
import { UserDefaultRegisterDTO } from '../dto/userDefaultRegister.dto';
import { User } from '../entities/user.entity';
import { checkValidationErrorsUser } from '../functions/checkValidationErrorsUser';
import { msg } from '../msg';
import { UserRepository } from '../repository/user.repository';

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
		
		const { uid, phone, email, password } = data;
		const whereClause = {
			[Op.or]: [{ uid }, { phone }, { email }],
		};
		const existingPatient = await this.userRepository.findOne({
			where: whereClause,
		});

		const errors = validatePropertyData({
			property: { uid, phone, email },
			data: existingPatient,
			msg: msg,
			checkErrors: checkValidationErrorsUser,
		});

		if (errors) {
			this.logger.error(`system ${msg.log.create}`);
			throwHttpExceptionProperties(errors, HttpStatus.CONFLICT);
		}

		const code = `${this.generateCode()}`;

		if (process.env.NODE_ENV !== 'development') {
			this.logger.log(`system - ${msg.log.emailActivated}`);
			this.emailService.activatedAccount({ code, email });
		}

		const hashPass = await hash(password, salt);

		const { uid: uidRol } = await this.findOneRolUseCase.execute({
			typeRol: this.configService.get<string>('DEFAULT_ROL_FROM_USER'),
		});

		await this.userRepository.save({
			...data,
			
			code: null,
			activatedAccount: true,
			password: hashPass,
			uidRol,
		} as User);
		this.logger.log(`${msg.log.createSuccess}`);

		return { msg: msg.msg.registerDefault };
	}

	

	private generateCode() {
		return Math.floor(Math.random() * 9000000) + 1000000;
	}
}
