import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH - Обновление аренды (завершение, продление, изменение статуса)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { status, endDate, extendDays } = body;

    const rent = await prisma.rent.findUnique({
      where: { id },
      include: { bike: true },
    });

    if (!rent) {
      return NextResponse.json(
        { error: 'Аренда не найдена' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    // Обновление статуса
    if (status) {
      updateData.status = status;

      // При завершении аренды - освобождаем велосипед
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        await prisma.bike.update({
          where: { id: rent.bikeId },
          data: { status: 'AVAILABLE' },
        });
      }

      // При просрочке
      if (status === 'OVERDUE') {
        updateData.isActive = false;
      }
    }

    // Продление аренды
    if (extendDays && extendDays > 0) {
      const currentEndDate = rent.endDate;
      const newEndDate = new Date(currentEndDate);
      newEndDate.setDate(newEndDate.getDate() + extendDays);
      updateData.endDate = newEndDate;

      // Пересчет стоимости (упрощенно - можно добавить логику тарифов)
      const daysDiff = extendDays;
      const bike = await prisma.bike.findUnique({
        where: { id: rent.bikeId },
      });
      if (bike) {
        const additionalPrice = Number(bike.pricePerDay) * daysDiff;
        const currentTotal = Number(rent.totalPrice);
        updateData.totalPrice = currentTotal + additionalPrice;
      }
    }

    // Обновление даты окончания
    if (endDate) {
      updateData.endDate = new Date(endDate);
    }

    const updatedRent = await prisma.rent.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        bike: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        payment: true,
      },
    });

    return NextResponse.json(updatedRent);
  } catch (error) {
    console.error('Ошибка при обновлении аренды:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении аренды' },
      { status: 500 }
    );
  }
}

// DELETE - Удаление аренды (с освобождением велосипеда)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    const rent = await prisma.rent.findUnique({
      where: { id },
    });

    if (rent) {
      // Освобождаем велосипед
      await prisma.bike.update({
        where: { id: rent.bikeId },
        data: { status: 'AVAILABLE' },
      });
    }

    await prisma.rent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении аренды:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении аренды' },
      { status: 500 }
    );
  }
}