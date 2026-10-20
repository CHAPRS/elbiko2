import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Парк аккумуляторов + активная аренда по каждому
export async function GET() {
  try {
    const batteries = await prisma.battery.findMany({
      orderBy: { name: 'asc' },
      include: {
        rents: {
          where: { isActive: true },
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
          take: 1,
        },
        _count: { select: { rents: true } },
      },
    });

    return NextResponse.json(batteries);
  } catch (error) {
    console.error('Ошибка GET /api/admin/batteries:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить аккумуляторы' },
      { status: 500 }
    );
  }
}

// POST - Новый аккумулятор в парке
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, serialNumber, capacityAh, voltage, pricePerDay, pricePerWeek, purchasePrice, purchaseDate, imageUrl, comment } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: 'Укажите название аккумулятора' },
        { status: 400 }
      );
    }

    const parseNum = (v: unknown) =>
      v === undefined || v === null || v === '' ? null : Number(v);

    const capacity = parseNum(capacityAh);
    const price = parseNum(pricePerDay);
    const priceWeek = parseNum(pricePerWeek);
    const purchase = parseNum(purchasePrice);
    const volts = voltage === undefined || voltage === null || voltage === '' ? null : Number(voltage);

    for (const [label, v] of [['Ёмкость', capacity], ['Цена за день', price], ['Цена за неделю', priceWeek], ['Закупочная цена', purchase], ['Напряжение', volts]] as const) {
      if (v !== null && (!Number.isFinite(v) || v < 0)) {
        return NextResponse.json({ error: `Некорректное значение: ${label}` }, { status: 400 });
      }
    }

    const battery = await prisma.battery.create({
      data: {
        name: String(name).trim(),
        serialNumber: serialNumber ? String(serialNumber).trim() : null,
        capacityAh: capacity,
        voltage: volts !== null ? Math.round(volts) : null,
        pricePerDay: price ?? 0,
        pricePerWeek: priceWeek,
        purchasePrice: purchase,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
        comment: comment ? String(comment).trim() : null,
      },
    });

    return NextResponse.json(battery, { status: 201 });
  } catch (error) {
    console.error('Ошибка POST /api/admin/batteries:', error);
    return NextResponse.json(
      { error: 'Не удалось создать аккумулятор' },
      { status: 500 }
    );
  }
}
