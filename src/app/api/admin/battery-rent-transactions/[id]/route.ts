import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseExtendDays, rentTotals } from '@/lib/txEdit';

const VALID_METHODS = ['CASH', 'SBP', 'CARD', 'TRANSFER'];

async function totalsFor(batteryRentId: number) {
  const [rent, txs] = await Promise.all([
    prisma.batteryRent.findUnique({ where: { id: batteryRentId }, select: { totalPrice: true } }),
    prisma.batteryRentTransaction.findMany({ where: { batteryRentId }, select: { type: true, amount: true } }),
  ]);
  return rentTotals(Number(rent?.totalPrice ?? 0), txs);
}

// PATCH /api/admin/battery-rent-transactions/[id] — правка суммы/способа/комментария.
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

    const tx = await prisma.batteryRentTransaction.findUnique({
      where: { id },
      include: { batteryRent: { select: { totalPrice: true } } },
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
        const newTotal = Number(tx.batteryRent.totalPrice) + delta;
        if (newTotal < 0) {
          throw new Error('Итоговая стоимость аренды не может быть отрицательной');
        }
        await t.batteryRent.update({ where: { id: tx.batteryRentId }, data: { totalPrice: newTotal } });
      }
      await t.batteryRentTransaction.update({ where: { id }, data });
    });

    const updated = await prisma.batteryRentTransaction.findUnique({ where: { id } });
    const totals = await totalsFor(tx.batteryRentId);
    return NextResponse.json({ ...updated, ...totals });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось обновить операцию';
    console.error('Ошибка PATCH /api/admin/battery-rent-transactions/[id]:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/battery-rent-transactions/[id] — удаление операции.
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

    const tx = await prisma.batteryRentTransaction.findUnique({
      where: { id },
      include: { batteryRent: { select: { totalPrice: true, endDate: true } } },
    });
    if (!tx) {
      return NextResponse.json({ error: 'Операция не найдена' }, { status: 404 });
    }

    let daysRolledBack: number | null = null;

    await prisma.$transaction(async (t) => {
      if (tx.type === 'EXTEND') {
        const data: Record<string, unknown> = {
          totalPrice: Math.max(0, Number(tx.batteryRent.totalPrice) - Number(tx.amount)),
        };
        const days = parseExtendDays(tx.comment);
        if (days !== null) {
          const end = new Date(tx.batteryRent.endDate);
          end.setDate(end.getDate() - days);
          data.endDate = end;
          daysRolledBack = days;
        }
        await t.batteryRent.update({ where: { id: tx.batteryRentId }, data });
      }
      await t.batteryRentTransaction.delete({ where: { id } });
    });

    const totals = await totalsFor(tx.batteryRentId);
    return NextResponse.json({ success: true, daysRolledBack, ...totals });
  } catch (error) {
    console.error('Ошибка DELETE /api/admin/battery-rent-transactions/[id]:', error);
    return NextResponse.json({ error: 'Не удалось удалить операцию' }, { status: 500 });
  }
}
