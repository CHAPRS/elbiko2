import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBuyoutSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const paymentsInclude = {
  payments: { orderBy: { dueDate: 'asc' as const } },
  bike: { select: { id: true, name: true, externalId: true } },
};

// Генерация равномерного графика: последняя строка забирает остаток от округления
function generateSchedule(
  totalPrice: number,
  firstDate: Date,
  count: number,
  interval: 'WEEKLY' | 'MONTHLY'
) {
  const base = Math.floor((totalPrice / count) * 100) / 100;
  const items = [];
  let allocated = 0;
  for (let i = 0; i < count; i++) {
    const dueDate = new Date(firstDate);
    if (interval === 'WEEKLY') {
      dueDate.setDate(dueDate.getDate() + i * 7);
    } else {
      dueDate.setMonth(dueDate.getMonth() + i);
    }
    const amount =
      i === count - 1
        ? Math.round((totalPrice - allocated) * 100) / 100
        : base;
    allocated += amount;
    items.push({ dueDate, amount });
  }
  return items;
}

// GET - Список выкупов (параметр status=ACTIVE|COMPLETED|CANCELLED)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && ['ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
      where.status = status;
    }

    const items = await prisma.buyout.findMany({
      where,
      include: paymentsInclude,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Ошибка GET /api/admin/buyouts:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить выкупы' },
      { status: 500 }
    );
  }
}

// POST - Создание выкупа (с готовым графиком payments или генерацией schedule)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createBuyoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, clientName, clientPhone, bikeId, totalPrice, startDate, comment, payments, schedule } =
      parsed.data;

    if (bikeId) {
      const bike = await prisma.bike.findUnique({ where: { id: bikeId } });
      if (!bike) {
        return NextResponse.json(
          { error: 'Велосипед не найден' },
          { status: 404 }
        );
      }
    }

    let paymentsData: { dueDate: Date; amount: number; comment?: string | null }[] = [];
    if (payments && payments.length > 0) {
      paymentsData = payments.map((p) => ({
        dueDate: p.dueDate,
        amount: p.amount,
        comment: p.comment?.trim() || null,
      }));
    } else if (schedule) {
      paymentsData = generateSchedule(totalPrice, schedule.firstDate, schedule.count, schedule.interval);
    }

    const buyout = await prisma.buyout.create({
      data: {
        title: title.trim(),
        clientName: clientName.trim(),
        clientPhone: clientPhone?.trim() || null,
        bikeId: bikeId || null,
        totalPrice,
        startDate: startDate || new Date(),
        comment: comment?.trim() || null,
        payments: { create: paymentsData },
      },
      include: paymentsInclude,
    });

    return NextResponse.json(buyout, { status: 201 });
  } catch (error) {
    console.error('Ошибка POST /api/admin/buyouts:', error);
    return NextResponse.json(
      { error: 'Не удалось создать выкуп' },
      { status: 500 }
    );
  }
}
