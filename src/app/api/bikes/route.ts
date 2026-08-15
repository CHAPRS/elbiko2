import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Публичный каталог: отдаем только байки, которые можно забронировать
export async function GET() {
  try {
    const bikes = await prisma.bike.findMany({
      where: { status: { not: 'MAINTENANCE' } },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(bikes);
  } catch (error) {
    console.error('Ошибка при получении каталога:', error);
    return NextResponse.json({ error: 'Не удалось загрузить каталог' }, { status: 500 });
  }
}
