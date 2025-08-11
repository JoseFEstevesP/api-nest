import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
	private readonly transporter: nodemailer.Transporter;

	constructor(@Optional() private readonly configService?: ConfigService) {
		if (!this.configService) {
			throw new Error(
				'ConfigService es necesario para el servicio EmailService',
			);
		}
		this.transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 465,
			secure: true,
			auth: {
				user: this.configService.get<string>('EMAIL_USER'),
				pass: this.configService.get<string>('EMAIL_PASS'),
			},
		});
	}

	private getHtmlTemplate(title: string, code: string, action: string): string {
		return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
              }
              .header {
                  background-color: #4CAF50;
                  color: white;
                  padding: 20px;
                  text-align: center;
                  border-radius: 5px 5px 0 0;
              }
              .content {
                  padding: 20px;
                  background-color: #f9f9f9;
                  border-radius: 0 0 5px 5px;
                  border: 1px solid #ddd;
                  border-top: none;
              }
              .code {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #4CAF50;
                  color: white;
                  font-size: 24px;
                  font-weight: bold;
                  border-radius: 5px;
                  margin: 15px 0;
                  letter-spacing: 3px;
              }
              .footer {
                  margin-top: 20px;
                  font-size: 12px;
                  color: #777;
                  text-align: center;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>${title}</h1>
          </div>
          <div class="content">
              <p>Hola,</p>
              <p>Para ${action}, por favor utiliza el siguiente código de verificación:</p>
              <div class="code">${code}</div>
              <p>Este código expirará en 15 minutos. Si no solicitaste esto, por favor ignora este correo.</p>
              <p>Gracias,<br>El equipo de Farmapatria</p>
          </div>
          <div class="footer">
              <p>© ${new Date().getFullYear()} Farmapatria. Todos los derechos reservados.</p>
          </div>
      </body>
      </html>
    `;
	}

	async recoveryPassword({ email, code }: { email: string; code: string }) {
		const subject = 'Restaurar contraseña | Farmapatria';
		const html = this.getHtmlTemplate(
			'Restablecer tu contraseña',
			code,
			'restablecer tu contraseña',
		);

		await this.transporter.sendMail({
			from: `Farmapatria <${process.env.EMAIL_USER}>`,
			to: email,
			subject,
			html,
			text: `Tu código para restablecer la contraseña es: ${code}`,
		});
	}

	async activatedAccount({ email, code }: { email: string; code: string }) {
		const subject = 'Activar cuenta | Farmapatria';
		const html = this.getHtmlTemplate(
			'Activar tu cuenta',
			code,
			'activar tu cuenta',
		);

		await this.transporter.sendMail({
			from: `Farmapatria <${process.env.EMAIL_USER}>`,
			to: email,
			subject,
			html,
			text: `Tu código de activación es: ${code}`,
		});
	}
}
