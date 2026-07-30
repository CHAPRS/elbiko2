import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Метод GET для получения активной аренды
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'Телефон не указан' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      return NextResponse.json({ activeRent: null, message: 'Пользователь не найден' });
    }

    // Ищем аренду, где isActive равен true (или 1 в MySQL)
    const activeRent = await prisma.rent.findFirst({
      where: {
        userId: user.id,
        isActive: true as any // Адаптировано под поле isActive
      },
      include: {
        bike: true 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ activeRent });
  } catch (error) {
    console.error('Ошибка в API:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка бэкенда' }, { status: 500 });
  }
}

// Метод PATCH для завершения аренды
export async function PATCH(request: Request) {
  try {
    const { rentId } = await request.json();

    if (!rentId) {
      return NextResponse.json({ error: 'ID аренды не указан' }, { status: 400 });
    }

    const rent = await prisma.rent.findFirst({
      where: {
        OR: [
          { id: Number(rentId) },
          { id: rentId as any }
        ]
      },
    });

    if (!rent) {
      return NextResponse.json({ error: 'Аренда не найдена' }, { status: 404 });
    }

    await prisma.$transaction([
      // 1. Снимаем флаг активности с этой аренды (isActive: false)
      prisma.rent.updateMany({
        where: {
          OR: [
            { id: Number(rentId) },
            { id: rentId as any }
          ]
        },
        data: { isActive: false as any },
      }),
      // 2. Освобождаем велосипед (status: 'FREE')
      prisma.bike.updateMany({
        where: { id: rent.bikeId as any },
        data: { status: 'FREE' as any },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Аренда успешно завершена' });
  } catch (error) {
    console.error('Ошибка в PATCH:', error);
    return NextResponse.json({ error: 'Не удалось завершить аренду' }, { status: 500 });
  }
}
