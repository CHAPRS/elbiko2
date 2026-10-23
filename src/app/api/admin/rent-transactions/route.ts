import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/rent-transactions?rentId=N — журнал операций аренды
export async function GET(request: Request) {
  try {
    const rentId = Number(new URL(request.url).searchParams.get('rentId'));
    if (!Number.isInteger(rentId) || rentId <= 0) {
      return NextResponse.json({ error: 'Некорректный rentId' }, { status: 400 });
    }
    const items = await prisma.rentTransaction.findMany({
      where: { rentId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Ошибка GET /api/admin/rent-transactions:', error);
    return NextResponse.json({ error: 'Не удалось загрузить журнал' }, { status: 500 });
  }
}
