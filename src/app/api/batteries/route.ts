import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Публичный каталог АКБ: отдаём все аккумуляторы без статусов —
// на сайте дедупликация по имени (одна карточка на модель).
export async function GET() {
  try {
    const batteries = await prisma.battery.findMany({
      select: {
        id: true,
        name: true,
        capacityAh: true,
        voltage: true,
        pricePerDay: true,
        pricePerWeek: true,
        imageUrl: true,
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(batteries);
  } catch (error) {
    console.error('Ошибка при получении каталога АКБ:', error);
    return NextResponse.json({ error: 'Не удалось загрузить каталог' }, { status: 500 });
  }
}
