import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';
import { Op } from 'sequelize';
import { UserRegisterDTO } from '../dto/userRegister.dto';
import { User } from '../entities/user.entity';
import { checkValidationErrorsUser } from '../functions/checkValidationErrorsUser';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class CreateProtectUserUseCase {
	private readonly logger = new Logger(CreateProtectUserUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly configService: ConfigService,
	) {}

	async execute({
		data,
		dataLog,
	}: {
		data: UserRegisterDTO;
		dataLog: string;
	}): Promise<{ msg: string }> {
		// oxlint-disable-next-line no-unused-vars
		const { confirmPassword, ...userData } = data;
		const { uid, phone, email, password } = userData;

		const whereClause = { [Op.or]: [{ uid }, { phone }, { email }] };
		const existingPatient = await this.userRepository.findOne({
			where: whereClause,
		});

		validatePropertyData({
			property: { uid, phone, email },
			data: existingPatient,
			msg: userMessages,
			checkErrors: checkValidationErrorsUser,
		});

		const hashPass = await hash(
			password,
			this.configService.get<number>('SALT_ROUNDS'),
		);

		const user = {
			...userData,
			password: hashPass,
			activatedAccount: true,
			code: null,
		} as User;

		await this.userRepository.create(user);
		this.logger.log(`${dataLog} ${userMessages.log.createSuccess}`);

		return { msg: userMessages.msg.registerAdmin };
	}
}
