import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { leadStatus, createLeadSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// GET - Получение всех заявок с фильтрацией
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status && leadStatus.safeParse(status).success ? { status } : {};

    const leads = await prisma.lead.findMany({
      where,
      include: {
        bike: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Ошибка при получении заявок:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заявок' },
      { status: 500 }
    );
  }
}

// POST - Создание новой заявки
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        ...parsed.data,
        bikeId: parsed.data.bikeId ?? null,
        status: 'NEW',
      },
      include: {
        bike: true,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании заявки:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании заявки' },
      { status: 500 }
    );
  }
}