import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@/services/email.service';
import { EnvironmentVariables } from '@/config/env.config';
import * as nodemailer from 'nodemailer';
import { InternalServerErrorException } from '@nestjs/common';

// Mock nodemailer
jest.mock('nodemailer');
const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn(() => ({
  sendMail: mockSendMail,
}));
(nodemailer.createTransport as jest.Mock) = mockCreateTransport;

describe('EmailService', () => {
  let service: EmailService;
  let mockConfigService: Partial<ConfigService<EnvironmentVariables>>;

  beforeEach(async () => {
    // Mock config service with environment values
    mockConfigService = {
      get: jest.fn((key: keyof EnvironmentVariables) => {
        const configValues: Partial<EnvironmentVariables> = {
          EMAIL_HOST: 'smtp.gmail.com',
          EMAIL_USER: 'test@example.com',
          EMAIL_PASS: 'test-password',
        };
        return configValues[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);

    // Reset mock before each test
    mockSendMail.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'test@example.com',
        pass: 'test-password',
      },
    });
  });

  describe('recoveryPassword', () => {
    it('debería enviar email de recuperación de contraseña', async () => {
      const emailData = { email: 'user@example.com', code: '123456' };
      mockSendMail.mockResolvedValue({}); // Mock successful send

      await service.recoveryPassword(emailData);

      expect(mockConfigService.get).toHaveBeenCalledWith('EMAIL_USER');
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'user@example.com',
        subject: 'Restaurar contraseña',
        html: expect.stringContaining('Restablecer tu contraseña'),
        text: 'Tu código para restablecer la contraseña es: 123456',
      });
    });

    it('debería lanzar InternalServerErrorException cuando falla el envío de email', async () => {
      const emailData = { email: 'user@example.com', code: '123456' };
      const error = new Error('Network error');
      mockSendMail.mockRejectedValue(error);

      await expect(service.recoveryPassword(emailData)).rejects.toThrow(InternalServerErrorException);
      await expect(service.recoveryPassword(emailData)).rejects.toThrow('Error al intentar enviar el correo.');
    });
  });

  describe('activatedAccount', () => {
    it('debería enviar email de activación de cuenta', async () => {
      const emailData = { email: 'user@example.com', code: '123456' };
      mockSendMail.mockResolvedValue({}); // Mock successful send

      await service.activatedAccount(emailData);

      expect(mockConfigService.get).toHaveBeenCalledWith('EMAIL_USER');
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'user@example.com',
        subject: 'Activar cuenta',
        html: expect.stringContaining('Activar tu cuenta'),
        text: 'Tu código de activación es: 123456',
      });
    });

    it('debería lanzar InternalServerErrorException cuando falla el envío de email', async () => {
      const emailData = { email: 'user@example.com', code: '123456' };
      const error = new Error('Network error');
      mockSendMail.mockRejectedValue(error);

      await expect(service.activatedAccount(emailData)).rejects.toThrow(InternalServerErrorException);
      await expect(service.activatedAccount(emailData)).rejects.toThrow('Error al intentar enviar el correo.');
    });
  });

  describe('métodos privados', () => {
    it('debería generar la plantilla HTML correcta para recuperación de contraseña', () => {
      const title = 'Restablecer tu contraseña';
      const code = '123456';
      const action = 'restablecer tu contraseña';

      // Access the private method using any type
      const html = (service as any).getHtmlTemplate(title, code, action);

      expect(html).toContain(title);
      expect(html).toContain(code);
      expect(html).toContain(action);
      expect(html).toContain('Para restablecer tu contraseña, por favor utiliza el siguiente código de verificación:');
    });

    it('debería generar la plantilla HTML correcta para activación de cuenta', () => {
      const title = 'Activar tu cuenta';
      const code = 'ABCDEF';
      const action = 'activar tu cuenta';

      // Access the private method using any type
      const html = (service as any).getHtmlTemplate(title, code, action);

      expect(html).toContain(title);
      expect(html).toContain(code);
      expect(html).toContain(action);
      expect(html).toContain('Para activar tu cuenta, por favor utiliza el siguiente código de verificación:');
    });
  });
});