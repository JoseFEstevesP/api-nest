import * as nodemailer from 'nodemailer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailService } from './email.service';

vi.mock('nodemailer', () => ({
	createTransport: vi.fn(),
}));

describe('EmailService', () => {
	let service: EmailService;
	let mockTransporter: any;
	let mockConfigService: any;

	beforeEach(() => {
		mockTransporter = {
			sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
		};

		mockConfigService = {
			get: vi.fn((key: string) => {
				const env = {
					EMAIL_USER: 'test@farmapatria.com',
					EMAIL_PASS: 'test-password',
				};
				return env[key];
			}),
		};

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
			from: expect.stringContaining('Farmapatria'),
			to: email,
			subject: 'Restaurar contraseña | Farmapatria',
			html: expect.stringContaining(code),
			text: `Tu código para restablecer la contraseña es: ${code}`,
		});
	});

	it('debería enviar email de activación de cuenta', async () => {
		const email = 'user@test.com';
		const code = '789012';

		await service.activatedAccount({ email, code });

		expect(mockTransporter.sendMail).toHaveBeenCalledWith({
			from: expect.stringContaining('Farmapatria'),
			to: email,
			subject: 'Activar cuenta | Farmapatria',
			html: expect.stringContaining(code),
			text: `Tu código de activación es: ${code}`,
		});
	});
});
