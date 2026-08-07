import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Получение всех аренд с фильтрацией
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const bikeId = searchParams.get('bikeId');

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = Number(userId);
    if (bikeId) where.bikeId = Number(bikeId);

    const rents = await prisma.rent.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(rents);
  } catch (error) {
    console.error('Ошибка при получении аренд:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении аренд' },
      { status: 500 }
    );
  }
}