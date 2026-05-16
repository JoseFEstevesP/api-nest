import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Op } from 'sequelize';
import { encrypt } from '@/functions/encrypt';
import { AuditRepository } from '@/modules/security/audit/repository/audit.repository';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { UserRepository } from '@/modules/security/user/repository/user.repository';

@Injectable()
export class CheckSessionUseCase {
	private readonly logger = new Logger(CheckSessionUseCase.name);

	constructor(
		private readonly auditRepository: AuditRepository,
		private readonly userRepository: UserRepository,
		private readonly configService: ConfigService,
	) {}

	async execute({ refreshToken }: { refreshToken?: string }): Promise<{ isAuthenticated: boolean; rol?: string }> {
		if (!refreshToken) {
			this.logger.debug('CheckSession: No refreshToken provided');
			return { isAuthenticated: false };
		}

		const audit = await this.auditRepository.findOne({
			where: {
				refreshToken: {
					[Op.eq]: refreshToken,
				},
			},
		});

		if (!audit) {
			this.logger.debug('CheckSession: No active session found');
			return { isAuthenticated: false };
		}

		this.logger.debug('CheckSession: Active session found', {
			uidUser: audit.uidUser,
		});

		const user = await this.userRepository.findOne({
			where: { uid: audit.uidUser },
			include: [{ model: Role, attributes: ['name', 'permissions'] }],
			useCache: false,
		});

		const encryptedRol = user?.rol
			? encrypt(JSON.stringify(user.rol), this.configService.get<string>('ENCRYPTION_KEY')!)
			: undefined;

		return { isAuthenticated: true, ...(encryptedRol && { rol: encryptedRol }) };
	}
}