import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { LEAD_STATUSES, isLeadStatus } from '@/lib/leadStatus';

// GET - Карточка одной заявки
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: Number(params.id) },
      include: { bike: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Ошибка при получении заявки:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заявки' },
      { status: 500 }
    );
  }
}

// PATCH - Обновление статуса, комментария и причины отказа
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { status, comment, rejectReason, bikeId } = body;

    if (status === undefined && comment === undefined && rejectReason === undefined && bikeId === undefined) {
      return NextResponse.json(
        { error: 'Нет полей для обновления' },
        { status: 400 }
      );
    }

    const data: Prisma.LeadUpdateInput = {};

    if (status !== undefined) {
      if (!isLeadStatus(status)) {
        return NextResponse.json(
          { error: `Статус должен быть одним из: ${LEAD_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }

      if (status === 'REJECTED' && !rejectReason) {
        return NextResponse.json(
          { error: 'Для отклонения заявки укажите причину' },
          { status: 400 }
        );
      }

      data.status = status;
      data.processedAt = status === 'NEW' ? null : new Date();
    }

    if (comment !== undefined) data.comment = comment ? String(comment) : null;
    if (rejectReason !== undefined) data.rejectReason = rejectReason ? String(rejectReason) : null;

    if (bikeId !== undefined) {
      data.bike = bikeId ? { connect: { id: Number(bikeId) } } : { disconnect: true };
    }

    const lead = await prisma.lead.update({
      where: { id },
      data,
      include: { bike: true },
    });

    return NextResponse.json(lead);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }
    console.error('Ошибка при обновлении заявки:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении заявки' },
      { status: 500 }
    );
  }
}

// DELETE - Удаление заявки
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lead.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }
    console.error('Ошибка при удалении заявки:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении заявки' },
      { status: 500 }
    );
  }
}
