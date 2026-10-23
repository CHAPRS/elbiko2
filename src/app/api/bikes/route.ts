import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reconcileFleetStatuses } from '@/lib/fleet';

export const dynamic = 'force-dynamic';

// Публичный каталог: отдаём все велосипеды, чтобы карточки
// отображались независимо от статуса (FREE, RENTED, MAINTENANCE и т.д.).
// CompactCatalog сам отфильтрует дубли и скроет City Courier.
export async function GET() {
  try {
    // Подтягиваем статусы к реальным арендам: арендованный байк не должен
    // светиться в каталоге как свободный из-за рассинхрона status
    await reconcileFleetStatuses();

    const bikes = await prisma.bike.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(bikes);
  } catch (error) {
    console.error('Ошибка при получении каталога:', error);
    return NextResponse.json({ error: 'Не удалось загрузить каталог' }, { status: 500 });
  }
}
