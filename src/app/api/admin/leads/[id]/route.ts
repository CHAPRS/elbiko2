import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { updateLeadSchema, idParamSchema } from '@/lib/validation';

// GET - Карточка одной заявки
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const parsed = idParamSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: parsed.data.id },
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
    const parsedParams = idParamSchema.safeParse(params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
    }

    const id = parsedParams.data.id;
    const body = await request.json();
    const parsed = updateLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { status, comment, rejectReason, bikeId } = parsed.data;

    if (status === undefined && comment === undefined && rejectReason === undefined && bikeId === undefined) {
      return NextResponse.json(
        { error: 'Нет полей для обновления' },
        { status: 400 }
      );
    }

    const data: Prisma.LeadUpdateInput = {};

    if (status !== undefined) {
      if (status === 'REJECTED' && !rejectReason) {
        return NextResponse.json(
          { error: 'Для отклонения заявки укажите причину' },
          { status: 400 }
        );
      }

      data.status = status;
      data.processedAt = status === 'NEW' ? null : new Date();
    }

    if (comment !== undefined) data.comment = comment;
    if (rejectReason !== undefined) data.rejectReason = rejectReason;

    if (bikeId !== undefined) {
      data.bike = bikeId ? { connect: { id: bikeId } } : { disconnect: true };
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
    const parsed = idParamSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
    }

    await prisma.lead.delete({
      where: { id: parsed.data.id },
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
