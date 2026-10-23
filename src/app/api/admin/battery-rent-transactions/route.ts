import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/battery-rent-transactions?batteryRentId=N — журнал операций аренды АКБ
export async function GET(request: Request) {
  try {
    const batteryRentId = Number(new URL(request.url).searchParams.get('batteryRentId'));
    if (!Number.isInteger(batteryRentId) || batteryRentId <= 0) {
      return NextResponse.json({ error: 'Некорректный batteryRentId' }, { status: 400 });
    }
    const items = await prisma.batteryRentTransaction.findMany({
      where: { batteryRentId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Ошибка GET /api/admin/battery-rent-transactions:', error);
    return NextResponse.json({ error: 'Не удалось загрузить журнал' }, { status: 500 });
  }
}
