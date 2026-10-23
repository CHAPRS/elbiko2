import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { escapeHtml } from '@/lib/html';
import { createOrderSchema } from '@/lib/validation';

const smtpHost = process.env.SMTP_HOST || '87.250.250.38';
const smtpPort = Number(process.env.SMTP_PORT) || 465;
const smtpSecure = process.env.SMTP_SECURE !== 'false';
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser;
const smtpTo = process.env.SMTP_TO || smtpUser;
const smtpServername = process.env.SMTP_TLS_SERVERNAME || 'smtp.yandex.ru';

export async function POST(request: Request) {
  if (!smtpUser || !smtpPass || !smtpFrom || !smtpTo) {
    console.error('SMTP-настройки не заданы в .env');
    return NextResponse.json(
      { error: 'Отправка почты не настроена' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, phone, bikeName } = parsed.data;

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
      to: smtpTo,
      subject: `⚡ Новая заявка на аренду: ${bikeName}`,
      html: `
        <h2>Новая заявка на бронирование велосипеда</h2>
        <p><b>Выбранная модель:</b> ${escapeHtml(bikeName)}</p>
        <p><b>Имя клиента:</b> ${escapeHtml(name)}</p>
        <p><b>Телефон для связи:</b> ${escapeHtml(phone)}</p>
        <br />
        <p><i>Необходимо связаться с клиентом в течение 5 минут!</i></p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Ошибка отправки почты:', error.message);

    if (error.message?.toLowerCase().includes('auth')) {
      return NextResponse.json(
        { error: 'Ошибка авторизации почты. Проверьте логин и пароль приложения в .env' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Не удалось отправить заявку. Попробуйте позже.' },
      { status: 500 }
    );
  }
}
