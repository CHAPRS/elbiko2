import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST - Фиксация пробега байка в любой момент (без привязки к аренде)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bikeId = Number(params.id);
    if (!Number.isInteger(bikeId) || bikeId <= 0) {
      return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });
    }

    const body = await request.json();
    const mileage = Number(body.mileage);
    if (!Number.isFinite(mileage) || mileage < 0 || !Number.isInteger(mileage)) {
      return NextResponse.json(
        { error: 'Некорректное значение пробега' },
        { status: 400 }
      );
    }

    const bike = await prisma.bike.findUnique({ where: { id: bikeId } });
    if (!bike) {
      return NextResponse.json(
        { error: 'Велосипед не найден' },
        { status: 404 }
      );
    }

    const mileageWarning =
      bike.mileage !== null && mileage < bike.mileage;

    const note =
      typeof body.note === 'string' && body.note.trim() ? body.note.trim() : null;

    const log = await prisma.$transaction(async (tx) => {
      const created = await tx.mileageLog.create({
        data: { bikeId, mileage, note },
      });
      await tx.bike.update({
        where: { id: bikeId },
        data: { mileage },
      });
      return created;
    });

    return NextResponse.json({ log, mileageWarning }, { status: 201 });
  } catch (error) {
    console.error('Ошибка POST /api/admin/bikes/[id]/mileage:', error);
    return NextResponse.json(
      { error: 'Не удалось сохранить пробег' },
      { status: 500 }
    );
  }
}

// GET - История показаний пробега по байку
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bikeId = Number(params.id);
    if (!Number.isInteger(bikeId) || bikeId <= 0) {
      return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });
    }

    const logs = await prisma.mileageLog.findMany({
      where: { bikeId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Ошибка GET /api/admin/bikes/[id]/mileage:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить историю пробега' },
      { status: 500 }
    );
  }
}
