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

    const { phone, password } = await request.json();

    // 1. Ищем курьера в MySQL
    const courier = await prisma.user.findUnique({
      where: { phone },
    });

    if (!courier) {
      return NextResponse.json({ error: 'Курьер не найден' }, { status: 404 });
    }

    // 2. Проверяем пароль
    const isValid = await verifyPassword(password, courier.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
    }

    // 3. Миграция: если пароль хранился в открытом виде — пересохраняем хеш
    if (courier.password && !courier.password.includes(':')) {
      const hashed = await hashPassword(password);
      await prisma.user.update({
        where: { id: courier.id },
        data: { password: hashed },
      });
    }

    // 4. Формируем сессию (сохраняем ID курьера)
    const response = NextResponse.json({ success: true, name: courier.name });

    // Устанавливаем защищенную httpOnly куку на 30 дней
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
