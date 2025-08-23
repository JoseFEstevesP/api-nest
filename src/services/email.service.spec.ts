import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailService } from './email.service';

vi.mock('nodemailer', () => ({
	createTransport: vi.fn(),
}));

describe('EmailService', () => {
	let service: EmailService;
	let mockTransporter: nodemailer.Transporter;
	let mockConfigService: ConfigService;

	beforeEach(() => {
		mockTransporter = {
			sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
		} as unknown as nodemailer.Transporter;

		mockConfigService = {
			get: vi.fn((key: string) => {
				const env = {
					EMAIL_USER: 'test@farmapatria.com',
					EMAIL_PASS: 'test-password',
					EMAIL_HOST: 'smtp.gmail.com',
				};
				return env[key];
			}),
		} as unknown as ConfigService;

		vi.mocked(nodemailer.createTransport).mockReturnValue(mockTransporter);
		service = new EmailService(mockConfigService);
	});

	it('debería estar definido', () => {
		expect(service).toBeDefined();
	});

	it('debería configurar el transporter correctamente', () => {
		expect(nodemailer.createTransport).toHaveBeenCalledWith({
			host: 'smtp.gmail.com',
			port: 465,
			secure: true,
			auth: {
				user: 'test@farmapatria.com',
				pass: 'test-password',
			},
		});
	});

	it('debería enviar email de recuperación de contraseña', async () => {
		const email = 'user@test.com';
		const code = '123456';

		await service.recoveryPassword({ email, code });

		expect(mockTransporter.sendMail).toHaveBeenCalledWith({
			from: 'test@farmapatria.com',
			to: email,
			subject: 'Restaurar contraseña',
			html: expect.stringContaining('Restablecer tu contraseña'),
			text: `Tu código para restablecer la contraseña es: ${code}`,
		});
	});

	it('debería enviar email de activación de cuenta', async () => {
		const email = 'user@test.com';
		const code = '789012';

		await service.activatedAccount({ email, code });

		expect(mockTransporter.sendMail).toHaveBeenCalledWith({
			from: 'test@farmapatria.com',
			to: email,
			subject: 'Activar cuenta',
			html: expect.stringContaining('Activar tu cuenta'),
			text: `Tu código de activación es: ${code}`,
		});
	});
});
