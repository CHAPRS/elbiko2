import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { phone, code, password } = await request.json();

    if (!phone || !code || !password) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль минимум 6 символов' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || user.passwordResetCode !== code) {
      return NextResponse.json({ error: 'Неверный код или телефон' }, { status: 400 });
    }

    if (!user.passwordResetCodeExpiresAt || new Date() > user.passwordResetCodeExpiresAt) {
      return NextResponse.json({ error: 'Код истёк. Запросите новый' }, { status: 400 });
    }

    const hashed = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetCode: null,
        passwordResetCodeExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка установки пароля:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
