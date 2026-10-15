import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBuyoutPaymentSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// POST - Добавление строки в график платежей выкупа
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const buyoutId = Number(params.id);
    if (!Number.isInteger(buyoutId) || buyoutId <= 0) {
      return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });
    }

    const buyout = await prisma.buyout.findUnique({ where: { id: buyoutId } });
    if (!buyout) {
      return NextResponse.json({ error: 'Выкуп не найден' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createBuyoutPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { dueDate, amount, comment } = parsed.data;

    const payment = await prisma.buyoutPayment.create({
      data: {
        buyoutId,
        dueDate,
        amount,
        comment: comment?.trim() || null,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Ошибка POST /api/admin/buyouts/[id]/payments:', error);
    return NextResponse.json(
      { error: 'Не удалось добавить платёж' },
      { status: 500 }
    );
  }
}
