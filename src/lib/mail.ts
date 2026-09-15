import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || '87.250.250.38';
const smtpPort = Number(process.env.SMTP_PORT) || 465;
const smtpSecure = process.env.SMTP_SECURE !== 'false';
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser;
const smtpServername = process.env.SMTP_TLS_SERVERNAME || 'smtp.yandex.ru';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(options: SendMailOptions): Promise<boolean> {
  if (!smtpUser || !smtpPass || !smtpFrom) {
    console.error('SMTP-настройки не заданы в .env');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        servername: smtpServername,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    return true;
  } catch (error: any) {
    console.error('Ошибка отправки почты:', error.message);
    return false;
  }
}
