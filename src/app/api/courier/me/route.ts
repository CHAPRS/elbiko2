import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = cookies();
    const courierSession = cookieStore.get('courier_session');

    if (!courierSession) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const userId = parseInt(courierSession.value, 10);

    // Ищем курьера, включая его АКТИВНУЮ сессию аренды и данные велосипеда
    const courier = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rentalSessions: {
          where: { status: 'ACTIVE' },
          include: { bike: true },
          take: 1,
        },
      },
    });

    if (!courier) {
      return NextResponse.json({ error: 'Курьер не найден' }, { status: 404 });
    }

    // Формируем чистый объект ответа
    const activeSession = courier.rentalSessions[0] || null;
    const activeBike = activeSession ? activeSession.bike : null;

    return NextResponse.json({
      name: courier.name,
      phone: courier.phone,
      balance: courier.balance,
      session: activeSession ? {
        id: activeSession.id,
        tariff: activeSession.tariff,
        startDate: activeSession.startDate,
      } : null,
      bike: activeBike ? {
        id: activeBike.id,
        speed: activeBike.speed,
        range: activeBike.range,
        motor: activeBike.motor,
        isWaterproof: activeBike.isWaterproof,
        status: activeBike.status,
      } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
