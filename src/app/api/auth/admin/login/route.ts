import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Простая проверка для тестирования
    if (username === 'admin' && password === 'admin') {
      // Устанавливаем admin_session cookie
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 дней
        path: '/',
      });

      return NextResponse.json({ success: true, role: 'admin' });
    }

    return NextResponse.json(
      { error: 'Неверный логин или пароль' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Ошибка авторизации админа:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}