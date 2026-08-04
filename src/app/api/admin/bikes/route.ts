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
// PATCH: Обновление статуса велосипеда
// ==========================================
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // Валидация входных данных
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные параметры (id, status)' },
        { status: 400 }
      );
    }

    // Проверка валидности передаваемого статуса
    const validStatuses = ['FREE', 'RENTED', 'MAINTENANCE'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Передан невалидный статус' },
        { status: 400 }
      );
    }

    // Обновление статуса в БД
    const updatedBike = await prisma.bike.update({
      where: { id: Number(id) },
      data: { status },
    });

    return NextResponse.json(updatedBike, { status: 200 });
  } catch (error) {
    console.error('Ошибка PATCH /api/admin/bikes:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить статус велосипеда' },
      { status: 500 }
    );
  }
}
