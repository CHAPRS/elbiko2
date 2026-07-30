import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { clientName, clientPhone, bikeId } = await request.json();

    if (!clientPhone || !bikeId) {
      return NextResponse.json(
        { error: 'Телефон и ID байка обязательны для бронирования' }, 
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { phone: clientPhone },
      update: { name: clientName },
      create: { phone: clientPhone, name: clientName },
    });

    const bike = await prisma.bike.findUnique({
      where: { id: Number(bikeId) }
    });

    if (!bike) {
      return NextResponse.json(
        { error: 'Выбранный электровелосипед не найден в базе данных' }, 
        { status: 404 }
      );
    }

    const days = 1;
    const totalPrice = bike.pricePerDay * days;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const result = await prisma.$transaction(async (tx) => {
      const updatedBike = await tx.bike.update({
        where: { id: bike.id },
        data: { status: 'RENTED' },
      });

      const rent = await tx.rent.create({
        data: {
          userId: user.id,
          bikeId: updatedBike.id,
          endDate,
          totalPrice,
          isActive: true,
        },
      });

      const payment = await tx.payment.create({
        data: {
          rentId: rent.id,
          amount: totalPrice,
          status: 'PENDING',
          paymentUrl: `https://yookassa.ru{rent.id}`,
        },
      });

      return { payment };
    });

    return NextResponse.json({ 
      success: true, 
      paymentUrl: result.payment.paymentUrl 
    });

  } catch (error: any) {
    console.error('Критическая ошибка транзакции в MySQL:', error);
    return NextResponse.json(
      { error: 'Database transaction failed', details: error.message }, 
      { status: 500 }
    );
  }
}
