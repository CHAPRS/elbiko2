import { NextResponse } from 'next/server';
// Импортируем созданный синглтон вместо создания нового экземпляра
import { prisma } from '@/lib/prisma';

// ==========================================
// GET: Получение списка всех велосипедов
// ==========================================
export async function GET() {
  try {
    const bikes = await prisma.bike.findMany({
      orderBy: {
        id: 'desc', // Новые велосипеды будут вверху списка
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
    const { name, speed, range, motor, isWaterproof } = body;

    // Валидация обязательных полей
    if (!name || !speed || !range || !motor) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля (name, speed, range, motor)' },
        { status: 400 }
      );
    }

    // Создание записи в БД с дефолтным статусом FREE
    const newBike = await prisma.bike.create({
      data: {
        name,
        speed,
        range,
        motor,
        isWaterproof: Boolean(isWaterproof), // Принудительное приведение к Boolean
        status: 'FREE',
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
    const { id, status, name, speed, range, motor, isWaterproof, pricePerDay } = body;

    // Валидация входных данных
    if (!id) {
      return NextResponse.json(
        { error: 'Отсутствует обязательный параметр (id)' },
        { status: 400 }
      );
    }

    // Формируем объект обновления только с переданными полями
    const updateData: any = {};

    if (status) {
      const validStatuses = ['FREE', 'RENTED', 'MAINTENANCE', 'AVAILABLE'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Передан невалидный статус' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (name !== undefined) updateData.name = name;
    if (speed !== undefined) updateData.speed = speed;
    if (range !== undefined) updateData.range = range;
    if (motor !== undefined) updateData.motor = motor;
    if (isWaterproof !== undefined) updateData.isWaterproof = Boolean(isWaterproof);
    if (pricePerDay !== undefined) updateData.pricePerDay = Number(pricePerDay);

    // Обновление данных в БД
    const updatedBike = await prisma.bike.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json(updatedBike, { status: 200 });
  } catch (error) {
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
    const activeRents = await prisma.rent.findMany({
      where: {
        bikeId: Number(id),
        isActive: true,
      },
    });

    if (activeRents.length > 0) {
      return NextResponse.json(
        { error: 'Невозможно удалить велосипед с активными арендами' },
        { status: 400 }
      );
    }

    // Удаляем велосипед
    await prisma.bike.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Ошибка DELETE /api/admin/bikes:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить велосипед' },
      { status: 500 }
    );
  }
}
