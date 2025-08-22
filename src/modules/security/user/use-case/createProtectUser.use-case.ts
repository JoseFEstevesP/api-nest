import { throwHttpExceptionProperties } from '@/functions/throwHttpException';
import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { hash } from 'bcrypt';
import { Op } from 'sequelize';
import { salt } from '../constants/sal';
import { UserRegisterDTO } from '../dto/userRegister.dto';
import { User } from '../entities/user.entity';
import { checkValidationErrorsUser } from '../functions/checkValidationErrorsUser';
import { msg } from '../msg';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class CreateProtectUserUseCase {
	private readonly logger = new Logger(CreateProtectUserUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

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

		const errors = validatePropertyData({
			property: { uid, phone, email },
			data: existingPatient,
			msg: msg,
			checkErrors: checkValidationErrorsUser,
		});

		if (errors) {
			this.logger.error(`${dataLog} ${msg.log.errorValidator}`);
			throwHttpExceptionProperties(errors, HttpStatus.CONFLICT);
		}

		const hashPass = await hash(password, salt);

		const user = {
			...userData,
			password: hashPass,
			activatedAccount: true,
			code: null,
		} as User;

		await this.userRepository.save(user);
		this.logger.log(`${dataLog} ${msg.log.createSuccess}`);

		return { msg: msg.msg.registerAdmin };
	}
}
