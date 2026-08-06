import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH - Обновление статуса заявки
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Статус обязателен' },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
      include: {
        bike: true,
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
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
    const id = Number(params.id);

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении заявки:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении заявки' },
      { status: 500 }
    );
  }
}