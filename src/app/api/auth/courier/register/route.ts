import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { sendMail } from '@/lib/mail';
import { randomBytes } from 'crypto';

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, password, name } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Укажите корректный email' }, { status: 400 });
    }

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Укажите номер телефона' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Пароль должен быть не менее 6 символов' }, { status: 400 });
    }

    const existingByEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingByEmail) {
      return NextResponse.json({ error: 'Email уже зарегистрирован' }, { status: 409 });
    }

    const existingByPhone = await prisma.user.findUnique({
      where: { phone: phone.trim() },
    });

    if (existingByPhone) {
      return NextResponse.json({ error: 'Телефон уже зарегистрирован' }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        name: name?.trim() || 'Курьер',
        password: hashed,
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: expiresAt,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://${request.headers.get('host')}` || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    const sent = await sendMail({
      to: user.email!,
      subject: 'Подтверждение регистрации в Elbiko',
      html: `
        <h2>Подтверждение регистрации</h2>
        <p>Здравствуйте, ${user.name || 'курьер'}!</p>
        <p>Для завершения регистрации перейдите по ссылке:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <p>Ссылка действительна 24 часа.</p>
        <p>Если вы не регистрировались, проигнорируйте это письмо.</p>
      `,
    });

    if (!sent) {
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { error: 'Не удалось отправить письмо. Проверьте настройки SMTP.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Регистрация выполнена. Проверьте почту.' });
  } catch (error) {
    console.error('Ошибка регистрации курьера:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
