import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { leadStatus, createLeadManualSchema } from '@/lib/validation';
import { upsertContactByPhone } from '@/lib/contact';

function daysBetween(start: Date, end: Date): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

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
        battery: {
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

// POST - Создание новой заявки вручную
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createLeadManualSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, phone, bikeName, bikeId, itemType, batteryId, message, rentDays, totalPrice, startDate, endDate } = parsed.data;

    const isBattery = itemType === 'BATTERY' || !!batteryId;

    if (isBattery && !batteryId) {
      return NextResponse.json({ error: 'Для заявки на АКБ выберите аккумулятор' }, { status: 400 });
    }
    if (!isBattery && !bikeId) {
      return NextResponse.json({ error: 'Для заявки выберите велосипед' }, { status: 400 });
    }

    let finalRentDays = rentDays;
    let finalTotalPrice = totalPrice;

    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        return NextResponse.json({ error: 'Дата окончания не может быть раньше даты начала' }, { status: 400 });
      }
      finalRentDays = daysBetween(startDate, endDate);
    }

    if (!finalTotalPrice && finalRentDays && bikeId && !isBattery) {
      const bike = await prisma.bike.findUnique({ where: { id: bikeId } });
      if (bike) {
        finalTotalPrice = Number(bike.pricePerDay) * finalRentDays;
      }
    }

    if (!finalTotalPrice && finalRentDays && batteryId && isBattery) {
      const battery = await prisma.battery.findUnique({ where: { id: batteryId } });
      if (battery) {
        finalTotalPrice = Number(battery.pricePerDay) * finalRentDays;
      }
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        bikeName: bikeName ?? null,
        bikeId: bikeId ?? null,
        itemType: isBattery ? 'BATTERY' : 'BIKE',
        batteryId: batteryId ?? null,
        message: message ?? null,
        rentDays: finalRentDays ?? null,
        totalPrice: finalTotalPrice ? finalTotalPrice : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: 'NEW',
      },
      include: {
        bike: true,
        battery: true,
      },
    });

    await upsertContactByPhone({
      fullName: name,
      phone,
      status: 'INQUIRY',
      source: 'ADMIN',
      notes: message || null,
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
