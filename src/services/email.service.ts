import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  async recoveryPassword({ email, code }) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Restaurar contraseña | farmapatria',
      text: `${process.env.EMAIL_HOST}/user/recoveryPass/${code}`,
    });
  }

  async activatedAccount({ email, code }) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Activar cuenta | farmapatria',
      text: `${process.env.EMAIL_HOST}/user/activated/${code}`,
    });
  }
}
