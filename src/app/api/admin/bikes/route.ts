import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Новое: Отдаем список всех велосипедов из базы данных для главной страницы
export async function GET() {
  try {
    const bikes = await prisma.bike.findMany();
    return NextResponse.json(bikes);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка при получении данных из БД' }, { status: 500 });
  }
}

// 1. Создание нового велосипеда в базе
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, model, power, maxSpeed, batteryLife, pricePerDay } = body;

    if (!name || !model || !power || !maxSpeed || !batteryLife || !pricePerDay) {
      return NextResponse.json({ error: 'Заполните все поля характеристики' }, { status: 400 });
    }

    const newBike = await prisma.bike.create({
      data: {
        name,
        model,
        power,
        maxSpeed,
        batteryLife,
        pricePerDay: Number(pricePerDay),
        status: 'FREE',
      },
    });

    return NextResponse.json({ success: true, bike: newBike });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка при добавлении в БД' }, { status: 500 });
  }
}

// 2. Изменение статуса велосипеда (FREE, MAINTENANCE, BLOCKED)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bikeId, status } = body;

    if (!bikeId || !status) {
      return NextResponse.json({ error: 'Не передан ID или статус' }, { status: 400 });
    }

    const updatedBike = await prisma.bike.update({
      where: { id: bikeId },
      data: { status },
    });

    return NextResponse.json({ success: true, bike: updatedBike });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления статуса' }, { status: 500 });
  }
}
