import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/password';
import { authLimiter, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    try {
      await authLimiter.check(5, ip);
    } catch {
      return NextResponse.json(
        { error: 'Слишком много попыток. Попробуйте позже.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const { login, password } = await request.json();

    if (!login || typeof login !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Укажите email/телефон и пароль' },
        { status: 400 }
      );
    }

    const trimmed = login.trim();
    const isEmail = trimmed.includes('@');

    const courier = await prisma.user.findFirst({
      where: isEmail
        ? { email: trimmed.toLowerCase() }
        : { phone: trimmed },
    });

    if (!courier) {
      return NextResponse.json({ error: 'Курьер не найден' }, { status: 404 });
    }

    if (isEmail && !courier.emailVerified) {
      return NextResponse.json(
        { error: 'Email не подтверждён. Проверьте почту.' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, courier.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
    }

    if (courier.password && !courier.password.includes(':')) {
      const hashed = await hashPassword(password);
      await prisma.user.update({
        where: { id: courier.id },
        data: { password: hashed },
      });
    }

    const response = NextResponse.json({ success: true, name: courier.name });

    response.cookies.set('courier_session', courier.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Ошибка авторизации курьера:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
