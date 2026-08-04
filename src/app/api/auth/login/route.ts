import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Задаем логин и пароль администратора (для MVP вшиваем в код, позже можно вынести в .env)
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'super-secret-password-2026';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true }, { status: 200 });

      // Устанавливаем защищенную сессионную куку на 1 день
      response.cookies.set('elbiko_admin_session', 'active_token_xyz_123', {
        httpOnly: true, // Защита от кражи куки через XSS-скрипты
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 часа
        path: '/',
      });

      return response;
    }

    // Если данные не совпали — отдаем ошибку
    return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
