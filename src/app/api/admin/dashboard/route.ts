import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Загружаем весь автопарк
    const bikes = await prisma.bike.findMany({
      orderBy: { name: 'asc' } // Сортируем по полю name, которое есть в вашей схеме
    });

    // 2. Загружаем логи аренд с пользователями и байками
    const rents = await prisma.rent.findMany({
      include: {
        user: true,
        bike: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Высчитываем KPI-метрики
    const totalBikes = bikes.length;
    const rentedBikes = bikes.filter((b: any) => String(b.status).toUpperCase() === 'RENTED').length;
    const freeBikes = bikes.filter((b: any) => String(b.status).toUpperCase() === 'FREE').length;
    
    const totalUsers = await prisma.user.count();
    
    // Считаем пользователей с привязанным Telegram
    const allUsers = await prisma.user.findMany();
    const usersWithTg = allUsers.filter((u: any) => u.telegramChatId !== null && u.telegramChatId !== undefined).length;

    return NextResponse.json({
      stats: { totalBikes, rentedBikes, freeBikes, totalUsers, usersWithTg },
      bikes,
      rents
    });
  } catch (error) {
    console.error('Ошибка API админки:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
