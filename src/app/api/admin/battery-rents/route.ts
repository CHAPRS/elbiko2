import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ledgerDebt } from '@/lib/rentLedger';
import { createBatteryRentAndMarkContact } from '@/lib/batteryRent';

export const dynamic = 'force-dynamic';

// GET - Список аренд АКБ с вычисляемыми paidTotal/debt из денежного журнала
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const batteryId = searchParams.get('batteryId');

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = Number(userId);
    if (batteryId) where.batteryId = Number(batteryId);

    const rents = await prisma.batteryRent.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        battery: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            status: true,
          },
        },
        transactions: { select: { type: true, amount: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // paidTotal — внесённая сумма (PAYMENT − REFUND), debt = цена + штрафы − внесено
    const result = rents.map((r) => {
      const { transactions, ...rest } = r;
      return { ...rest, ...ledgerDebt(Number(r.totalPrice), transactions) };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка при получении аренд АКБ:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении аренд АКБ' },
      { status: 500 }
    );
  }
}

// POST - Прямое оформление аренды АКБ (курьер создаётся/обновляется по телефону)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, batteryId, days, totalPrice, startDate, endDate } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'Укажите имя клиента' }, { status: 400 });
    }
    if (!phone || !String(phone).trim()) {
      return NextResponse.json({ error: 'Укажите телефон клиента' }, { status: 400 });
    }
    if (!batteryId) {
      return NextResponse.json({ error: 'Выберите аккумулятор' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { phone: String(phone).trim() },
      update: { name: String(name).trim() },
      create: { phone: String(phone).trim(), name: String(name).trim() },
    });

    const rent = await createBatteryRentAndMarkContact({
      userId: user.id,
      batteryId: Number(batteryId),
      days: days !== undefined && days !== null && days !== '' ? Number(days) : undefined,
      totalPrice:
        totalPrice !== undefined && totalPrice !== null && totalPrice !== ''
          ? Number(totalPrice)
          : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      fullName: String(name).trim(),
      phone: String(phone).trim(),
    });

    return NextResponse.json(rent, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Не удалось оформить аренду АКБ';
    console.error('Ошибка POST /api/admin/battery-rents:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
