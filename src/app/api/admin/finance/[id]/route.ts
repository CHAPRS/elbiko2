import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { updateMiscTransactionSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// PATCH - Редактирование прочей операции
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
    const parsed = updateMiscTransactionSchema.safeParse(body);

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

    const updateData: Prisma.MiscTransactionUpdateInput = {};
    if (fields.kind !== undefined) updateData.kind = fields.kind;
    if (fields.title !== undefined) updateData.title = fields.title.trim();
    if (fields.amount !== undefined) updateData.amount = fields.amount;
    if (fields.method !== undefined) updateData.method = fields.method;
    if (fields.comment !== undefined) updateData.comment = fields.comment?.trim() || null;
    if (fields.createdAt !== undefined && fields.createdAt !== null) {
      updateData.createdAt = fields.createdAt;
    }
    if (fields.bikeId !== undefined) {
      updateData.bike = fields.bikeId
        ? { connect: { id: fields.bikeId } }
        : { disconnect: true };
    }

    const item = await prisma.miscTransaction.update({
      where: { id },
      data: updateData,
      include: {
        bike: { select: { id: true, name: true, externalId: true } },
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Операция не найдена' }, { status: 404 });
    }
    console.error('Ошибка PATCH /api/admin/finance/[id]:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить операцию' },
      { status: 500 }
    );
  }
}

// DELETE - Удаление прочей операции
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Некорректный id' }, { status: 400 });
    }

    await prisma.miscTransaction.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Операция не найдена' }, { status: 404 });
    }
    console.error('Ошибка DELETE /api/admin/finance/[id]:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить операцию' },
      { status: 500 }
    );
  }
}
