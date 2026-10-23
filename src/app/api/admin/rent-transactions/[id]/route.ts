import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseExtendDays, rentTotals } from '@/lib/txEdit';

const VALID_METHODS = ['CASH', 'SBP', 'CARD', 'TRANSFER'];

async function totalsFor(rentId: number) {
  const [rent, txs] = await Promise.all([
    prisma.rent.findUnique({ where: { id: rentId }, select: { totalPrice: true } }),
    prisma.rentTransaction.findMany({ where: { rentId }, select: { type: true, amount: true } }),
  ]);
  return rentTotals(Number(rent?.totalPrice ?? 0), txs);
}

// PATCH /api/admin/rent-transactions/[id] — правка суммы/способа/комментария.
// Для EXTEND разница суммы корректирует totalPrice аренды.
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
    }
    const body = await request.json();
    const { amount, comment, method } = body;

    const tx = await prisma.rentTransaction.findUnique({
      where: { id },
      include: { rent: { select: { totalPrice: true } } },
    });
    if (!tx) {
      return NextResponse.json({ error: 'Операция не найдена' }, { status: 404 });
    }

    const data: Record<string, unknown> = {};

    let newAmount: number | undefined;
    if (amount !== undefined && amount !== null && amount !== '') {
      newAmount = Math.round(Number(amount) * 100) / 100;
      if (!Number.isFinite(newAmount) || newAmount <= 0) {
        return NextResponse.json({ error: 'Сумма должна быть больше нуля' }, { status: 400 });
      }
      data.amount = newAmount;
    }

    if (method !== undefined) {
      if (method !== null && method !== '' && !VALID_METHODS.includes(method)) {
        return NextResponse.json({ error: 'Некорректный способ оплаты' }, { status: 400 });
      }
      data.method = method === '' ? null : method;
    }
    if (comment !== undefined) {
      data.comment = typeof comment === 'string' && comment.trim() ? comment.trim() : null;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    const delta = newAmount !== undefined ? newAmount - Number(tx.amount) : 0;

    await prisma.$transaction(async (t) => {
      // Продление: корректируем общую стоимость аренды на разницу
      if (tx.type === 'EXTEND' && delta !== 0) {
        const newTotal = Number(tx.rent.totalPrice) + delta;
        if (newTotal < 0) {
          throw new Error('Итоговая стоимость аренды не может быть отрицательной');
        }
        await t.rent.update({ where: { id: tx.rentId }, data: { totalPrice: newTotal } });
      }
      await t.rentTransaction.update({ where: { id }, data });
    });

    const updated = await prisma.rentTransaction.findUnique({ where: { id } });
    const totals = await totalsFor(tx.rentId);
    return NextResponse.json({ ...updated, ...totals });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось обновить операцию';
    console.error('Ошибка PATCH /api/admin/rent-transactions/[id]:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/rent-transactions/[id] — удаление операции.
// EXTEND: сумма вычитается из totalPrice, дни откатываются по комментарию.
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
    }

    const tx = await prisma.rentTransaction.findUnique({
      where: { id },
      include: { rent: { select: { totalPrice: true, endDate: true } } },
    });
    if (!tx) {
      return NextResponse.json({ error: 'Операция не найдена' }, { status: 404 });
    }

    let daysRolledBack: number | null = null;

    await prisma.$transaction(async (t) => {
      if (tx.type === 'EXTEND') {
        const data: Record<string, unknown> = {
          totalPrice: Math.max(0, Number(tx.rent.totalPrice) - Number(tx.amount)),
        };
        const days = parseExtendDays(tx.comment);
        if (days !== null) {
          const end = new Date(tx.rent.endDate);
          end.setDate(end.getDate() - days);
          data.endDate = end;
          daysRolledBack = days;
        }
        await t.rent.update({ where: { id: tx.rentId }, data });
      }
      await t.rentTransaction.delete({ where: { id } });
    });

    const totals = await totalsFor(tx.rentId);
    return NextResponse.json({ success: true, daysRolledBack, ...totals });
  } catch (error) {
    console.error('Ошибка DELETE /api/admin/rent-transactions/[id]:', error);
    return NextResponse.json({ error: 'Не удалось удалить операцию' }, { status: 500 });
  }
}
