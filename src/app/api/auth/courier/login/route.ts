import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    // 1. Ищем курьера в MySQL
    const courier = await prisma.user.findUnique({
      where: { phone },
    });

    if (!courier) {
      return NextResponse.json({ error: 'Курьер не найден' }, { status: 404 });
    }

    // 2. Проверяем пароль (в продакшене используйте bcrypt, сейчас сверяем строки из сида)
    if (courier.password !== password) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
    }

    // 3. Формируем сессию (сохраняем ID курьера)
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
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
