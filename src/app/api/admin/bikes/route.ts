import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createBikeSchema, updateBikeSchema } from '@/lib/validation';

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
    const parsed = createBikeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const newBike = await prisma.bike.create({
      data: {
        ...parsed.data,
        status: parsed.data.status ?? 'FREE',
        isWaterproof: parsed.data.isWaterproof ?? false,
        pricePerDay: parsed.data.pricePerDay ?? 500,
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
    const parsed = updateBikeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { id, ...fields } = parsed.data;
    const updateData: Prisma.BikeUpdateInput = {};

    if (fields.name !== undefined) updateData.name = fields.name;
    if (fields.speed !== undefined) updateData.speed = fields.speed;
    if (fields.range !== undefined) updateData.range = fields.range;
    if (fields.motor !== undefined) updateData.motor = fields.motor;
    if (fields.isWaterproof !== undefined) updateData.isWaterproof = fields.isWaterproof;
    if (fields.imageUrl !== undefined) updateData.imageUrl = fields.imageUrl;
    if (fields.pricePerDay !== undefined) updateData.pricePerDay = fields.pricePerDay;

    if (fields.status !== undefined) {
      // Нельзя вручную освободить или отправить на сервис байк с активной арендой
      if (fields.status !== 'RENTED') {
        const activeRents = await prisma.rent.count({
          where: { bikeId: id, isActive: true },
        });

        if (activeRents > 0) {
          return NextResponse.json(
            { error: 'У велосипеда есть активная аренда — сначала завершите её' },
            { status: 409 }
          );
        }
      }

      updateData.status = fields.status;
    }

    const updatedBike = await prisma.bike.update({
      where: { id },
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
