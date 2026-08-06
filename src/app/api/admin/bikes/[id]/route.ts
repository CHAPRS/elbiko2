import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Получение конкретного велосипеда
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    const bike = await prisma.bike.findUnique({
      where: { id },
      include: {
        rentalSessions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy: {
            startDate: 'desc',
          },
          take: 10,
        },
        rents: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!bike) {
      return NextResponse.json(
        { error: 'Велосипед не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(bike);
  } catch (error) {
    console.error('Ошибка при получении велосипеда:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении велосипеда' },
      { status: 500 }
    );
  }
}