import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createMiscTransactionSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// GET - Список прочих операций (доходы/расходы вне аренды)
// Параметры: kind=INCOME|EXPENSE, from, to (ISO-даты), bikeId, take
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get('kind');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const bikeId = searchParams.get('bikeId');
    const takeParam = Number(searchParams.get('take'));
    const take = Number.isFinite(takeParam) && takeParam > 0
      ? Math.min(Math.floor(takeParam), 500)
      : 100;

    const where: any = {};
    if (kind === 'INCOME' || kind === 'EXPENSE') {
      where.kind = kind;
    }
    if (from || to) {
      where.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (isNaN(fromDate.getTime())) {
          return NextResponse.json({ error: 'Некорректная дата "from"' }, { status: 400 });
        }
        where.createdAt.gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (isNaN(toDate.getTime())) {
          return NextResponse.json({ error: 'Некорректная дата "to"' }, { status: 400 });
        }
        where.createdAt.lte = toDate;
      }
    }
    if (bikeId) {
      const id = Number(bikeId);
      if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json({ error: 'Некорректный bikeId' }, { status: 400 });
      }
      where.bikeId = id;
    }

    const items = await prisma.miscTransaction.findMany({
      where,
      include: {
        bike: { select: { id: true, name: true, externalId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Ошибка GET /api/admin/finance:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить операции' },
      { status: 500 }
    );
  }
}

// POST - Создание прочей операции
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createMiscTransactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { kind, title, amount, method, bikeId, comment, createdAt } = parsed.data;

    if (bikeId) {
      const bike = await prisma.bike.findUnique({ where: { id: bikeId } });
      if (!bike) {
        return NextResponse.json(
          { error: 'Велосипед не найден' },
          { status: 404 }
        );
      }
    }

    const item = await prisma.miscTransaction.create({
      data: {
        kind,
        title: title.trim(),
        amount,
        method: method || null,
        bikeId: bikeId || null,
        comment: comment?.trim() || null,
        ...(createdAt ? { createdAt } : {}),
      },
      include: {
        bike: { select: { id: true, name: true, externalId: true } },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Ошибка POST /api/admin/finance:', error);
    return NextResponse.json(
      { error: 'Не удалось создать операцию' },
      { status: 500 }
    );
  }
}
