import { NextResponse } from 'next/server';
import { createAdminSessionToken } from '@/lib/session';
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

    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error('ADMIN_USERNAME/ADMIN_PASSWORD не заданы в .env');
      return NextResponse.json(
        { error: 'Вход в админ-панель не настроен' },
        { status: 500 }
      );
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
    }

    const token = await createAdminSessionToken();
    const response = NextResponse.json({ success: true, role: 'admin' });

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Ошибка авторизации админа:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
