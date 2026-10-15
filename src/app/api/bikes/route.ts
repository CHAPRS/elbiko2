import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Публичный каталог: отдаём все велосипеды, чтобы карточки
// отображались независимо от статуса (FREE, RENTED, MAINTENANCE и т.д.).
// CompactCatalog сам отфильтрует дубли и скроет City Courier.
export async function GET() {
  try {
    const bikes = await prisma.bike.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(bikes);
  } catch (error) {
    console.error('Ошибка при получении каталога:', error);
    return NextResponse.json({ error: 'Не удалось загрузить каталог' }, { status: 500 });
  }
}
