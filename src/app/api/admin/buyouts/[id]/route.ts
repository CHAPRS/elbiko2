import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { updateBuyoutSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const paymentsInclude = {
  payments: { orderBy: { dueDate: 'asc' as const } },
  bike: { select: { id: true, name: true, externalId: true } },
};

// PATCH - Редактирование выкупа (поля и статус)
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
    const parsed = updateBuyoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const fields = parsed.data;

    if (fields.bikeId) {
      const bike = await prisma.bike.findUnique({ where: { id: fields.bikeId } });
      if (!bike) {
        return NextResponse.json(
          { error: 'Велосипед не найден' },
          { status: 404 }
        );
      }
    }

    const updateData: Prisma.BuyoutUpdateInput = {};
    if (fields.title !== undefined) updateData.title = fields.title.trim();
    if (fields.clientName !== undefined) updateData.clientName = fields.clientName.trim();
    if (fields.clientPhone !== undefined) updateData.clientPhone = fields.clientPhone?.trim() || null;
    if (fields.totalPrice !== undefined) updateData.totalPrice = fields.totalPrice;
    if (fields.status !== undefined) updateData.status = fields.status;
    if (fields.startDate !== undefined && fields.startDate !== null) {
      updateData.startDate = fields.startDate;
    }
    if (fields.comment !== undefined) updateData.comment = fields.comment?.trim() || null;
    if (fields.bikeId !== undefined) {
      updateData.bike = fields.bikeId
        ? { connect: { id: fields.bikeId } }
        : { disconnect: true };
    }

    const item = await prisma.buyout.update({
      where: { id },
      data: updateData,
      include: paymentsInclude,
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Выкуп не найден' }, { status: 404 });
    }
    console.error('Ошибка PATCH /api/admin/buyouts/[id]:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить выкуп' },
      { status: 500 }
    );
  }
}

// DELETE - Удаление выкупа вместе с графиком платежей
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });
    }

    await prisma.buyout.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Выкуп не найден' }, { status: 404 });
    }
    console.error('Ошибка DELETE /api/admin/buyouts/[id]:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить выкуп' },
      { status: 500 }
    );
  }
}
