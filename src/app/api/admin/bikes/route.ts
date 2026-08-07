import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { BIKE_STATUSES, isBikeStatus } from '@/lib/bikeStatus';

// ==========================================
// GET: Получение списка всех велосипедов
// ==========================================
export async function GET() {
  try {
    const bikes = await prisma.bike.findMany({
      orderBy: {
        id: 'desc', // Новые велосипеды будут вверху списка
      },
      include: {
        _count: {
          select: { rents: { where: { isActive: true } } },
        },
      },
    });
    return NextResponse.json(bikes, { status: 200 });
  } catch (error) {
    console.error('Ошибка GET /api/admin/bikes:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить список велосипедов' },
      { status: 500 }
    );
  }
}

// ==========================================
// POST: Создание нового велосипеда
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, speed, range, motor, isWaterproof, pricePerDay, status, imageUrl } = body;

    if (!name || !speed || !range || !motor) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля (name, speed, range, motor)' },
        { status: 400 }
      );
    }

    if (status !== undefined && !isBikeStatus(status)) {
      return NextResponse.json(
        { error: `Статус должен быть одним из: ${BIKE_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const price = pricePerDay === undefined ? 500 : Number(pricePerDay);
    if (Number.isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Цена аренды должна быть положительным числом' },
        { status: 400 }
      );
    }

    const newBike = await prisma.bike.create({
      data: {
        name: String(name),
        speed: String(speed),
        range: String(range),
        motor: String(motor),
        isWaterproof: Boolean(isWaterproof),
        pricePerDay: price,
        imageUrl: imageUrl ? String(imageUrl) : null,
        status: status ?? 'FREE',
      },
    });

    return NextResponse.json(newBike, { status: 201 });
  } catch (error) {
    console.error('Ошибка POST /api/admin/bikes:', error);
    return NextResponse.json(
      { error: 'Не удалось создать велосипед' },
      { status: 500 }
    );
  }
}

// ==========================================
// PATCH: Обновление статуса или данных велосипеда
// ==========================================
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, name, speed, range, motor, isWaterproof, pricePerDay, imageUrl } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Отсутствует обязательный параметр (id)' },
        { status: 400 }
      );
    }

    const updateData: Prisma.BikeUpdateInput = {};

    if (status !== undefined) {
      if (!isBikeStatus(status)) {
        return NextResponse.json(
          { error: `Статус должен быть одним из: ${BIKE_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }

      // Нельзя вручную освободить или отправить на сервис байк с активной арендой
      if (status !== 'RENTED') {
        const activeRents = await prisma.rent.count({
          where: { bikeId: Number(id), isActive: true },
        });

        if (activeRents > 0) {
          return NextResponse.json(
            { error: 'У велосипеда есть активная аренда — сначала завершите её' },
            { status: 409 }
          );
        }
      }

      updateData.status = status;
    }

    if (name !== undefined) updateData.name = String(name);
    if (speed !== undefined) updateData.speed = String(speed);
    if (range !== undefined) updateData.range = String(range);
    if (motor !== undefined) updateData.motor = String(motor);
    if (isWaterproof !== undefined) updateData.isWaterproof = Boolean(isWaterproof);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl ? String(imageUrl) : null;

    if (pricePerDay !== undefined) {
      const price = Number(pricePerDay);
      if (Number.isNaN(price) || price <= 0) {
        return NextResponse.json(
          { error: 'Цена аренды должна быть положительным числом' },
          { status: 400 }
        );
      }
      updateData.pricePerDay = price;
    }

    const updatedBike = await prisma.bike.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json(updatedBike, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Велосипед не найден' }, { status: 404 });
    }
    console.error('Ошибка PATCH /api/admin/bikes:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить данные велосипеда' },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE: Удаление велосипеда
// ==========================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Отсутствует обязательный параметр (id)' },
        { status: 400 }
      );
    }

    // Проверяем, не связан ли велосипед с активными арендами
    const activeRents = await prisma.rent.count({
      where: {
        bikeId: Number(id),
        isActive: true,
      },
    });

    if (activeRents > 0) {
      return NextResponse.json(
        { error: 'Невозможно удалить велосипед с активными арендами' },
        { status: 409 }
      );
    }

    const activeSessions = await prisma.rentalSession.count({
      where: { bikeId: Number(id), status: 'ACTIVE' },
    });

    if (activeSessions > 0) {
      return NextResponse.json(
        { error: 'Невозможно удалить велосипед с активной сессией аренды' },
        { status: 409 }
      );
    }

    await prisma.bike.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Велосипед не найден' }, { status: 404 });
    }
    console.error('Ошибка DELETE /api/admin/bikes:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить велосипед' },
      { status: 500 }
    );
  }
}
