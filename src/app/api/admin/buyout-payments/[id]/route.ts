import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { updateBuyoutPaymentSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// PATCH - Редактирование строки графика / отметка оплаты
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateBuyoutPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const fields = parsed.data;
    const updateData: Prisma.BuyoutPaymentUpdateInput = {};

    if (fields.dueDate !== undefined) updateData.dueDate = fields.dueDate;
    if (fields.amount !== undefined) updateData.amount = fields.amount;
    if (fields.comment !== undefined) updateData.comment = fields.comment?.trim() || null;

    if (fields.status !== undefined) {
      updateData.status = fields.status;
      if (fields.status === 'PAID') {
        updateData.paidAt = new Date();
      } else {
        updateData.paidAt = null;
      }
    }
    if (fields.method !== undefined) updateData.method = fields.method;

    const item = await prisma.buyoutPayment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Платёж не найден' }, { status: 404 });
    }
    console.error('Ошибка PATCH /api/admin/buyout-payments/[id]:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить платёж' },
      { status: 500 }
    );
  }
}

// DELETE - Удаление строки графика (только неоплаченной)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });
    }

    const payment = await prisma.buyoutPayment.findUnique({ where: { id } });
    if (!payment) {
      return NextResponse.json({ error: 'Платёж не найден' }, { status: 404 });
    }
    if (payment.status === 'PAID') {
      return NextResponse.json(
        { error: 'Оплаченный платёж нельзя удалить — снимите отметку оплаты' },
        { status: 409 }
      );
    }

    await prisma.buyoutPayment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка DELETE /api/admin/buyout-payments/[id]:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить платёж' },
      { status: 500 }
    );
  }
}
