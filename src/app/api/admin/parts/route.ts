import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Список номенклатуры склада + итоги
export async function GET() {
  try {
    const parts = await prisma.part.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { transactions: true } },
      },
    });

    const totals = parts.reduce(
      (acc, p) => {
        acc.positions += 1;
        acc.units += Number(p.stockQty);
        acc.value += Number(p.stockQty) * Number(p.lastPrice ?? 0);
        return acc;
      },
      { positions: 0, units: 0, value: 0 }
    );
    totals.value = Math.round(totals.value * 100) / 100;

    return NextResponse.json({ parts, totals });
  } catch (error) {
    console.error('Ошибка GET /api/admin/parts:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить склад' },
      { status: 500 }
    );
  }
}

// POST - Новая номенклатура
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, sku, category, unit, comment } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: 'Укажите название запчасти' },
        { status: 400 }
      );
    }

    const part = await prisma.part.create({
      data: {
        name: String(name).trim(),
        sku: sku ? String(sku).trim() : null,
        category: category ? String(category).trim() : null,
        unit: unit ? String(unit).trim() : 'шт',
        comment: comment ? String(comment).trim() : null,
      },
    });

    return NextResponse.json(part, { status: 201 });
  } catch (error) {
    console.error('Ошибка POST /api/admin/parts:', error);
    return NextResponse.json(
      { error: 'Не удалось создать позицию' },
      { status: 500 }
    );
  }
}
