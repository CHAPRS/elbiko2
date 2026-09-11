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

    // Ищем курьера и его активную аренду
    const courier = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rents: {
          where: { status: { in: ['ACTIVE', 'OVERDUE'] } },
          include: { bike: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!courier) {
      return NextResponse.json({ error: 'Курьер не найден' }, { status: 404 });
    }

    const activeRent = courier.rents[0] || null;

    return NextResponse.json({
      name: courier.name,
      phone: courier.phone,
      balance: courier.balance,
      activeRental: activeRent ? {
        id: activeRent.id,
        startDate: activeRent.startDate,
        endDate: activeRent.endDate,
        status: activeRent.status,
        totalPrice: activeRent.totalPrice,
        bike: activeRent.bike ? {
          id: activeRent.bike.id,
          name: activeRent.bike.name,
          title: activeRent.bike.name,
          externalId: activeRent.bike.externalId,
          speed: activeRent.bike.speed,
          range: activeRent.bike.range,
          motor: activeRent.bike.motor,
          isWaterproof: activeRent.bike.isWaterproof,
          status: activeRent.bike.status,
        } : null,
      } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
