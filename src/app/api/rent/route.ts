import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRent } from '@/lib/rent';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = body.clientPhone || body.phone;
    const name = body.clientName || body.name || 'Клиент с сайта';
    const bikeId = body.bikeId;
    const days = Number(body.days) > 0 ? Number(body.days) : 1;

    if (!phone || !bikeId) {
      return NextResponse.json(
        { error: 'Телефон и ID байка обязательны для бронирования' },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { phone: String(phone) },
      update: { name },
      create: { phone: String(phone), name },
    });

    const rent = await createRent({ userId: user.id, bikeId: Number(bikeId), days });

    return NextResponse.json({ success: true, rentId: rent.id, totalPrice: rent.totalPrice });
  } catch (error: any) {
    console.error('Ошибка при создании аренды:', error);
    return NextResponse.json(
      { error: error.message || 'Не удалось оформить аренду' },
      { status: 400 }
    );
  }
}
