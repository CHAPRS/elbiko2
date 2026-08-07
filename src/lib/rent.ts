import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

interface CreateRentInput {
  userId: number;
  bikeId: number;
  days: number;
}

// Оформление аренды: бронь байка, запись аренды и ожидающий платеж создаются атомарно
export async function createRent({ userId, bikeId, days }: CreateRentInput) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const bike = await tx.bike.findUnique({ where: { id: bikeId } });

    if (!bike) {
      throw new Error('Велосипед не найден');
    }

    if (bike.status !== 'FREE') {
      throw new Error('Велосипед недоступен: он уже в аренде или на сервисе');
    }

    const totalPrice = Number(bike.pricePerDay) * days;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    await tx.bike.update({
      where: { id: bike.id },
      data: { status: 'RENTED' },
    });

    const rent = await tx.rent.create({
      data: {
        userId,
        bikeId: bike.id,
        endDate,
        totalPrice,
        isActive: true,
        status: 'ACTIVE',
      },
    });

    await tx.payment.create({
      data: {
        rentId: rent.id,
        amount: totalPrice,
        status: 'PENDING',
      },
    });

    return rent;
  });
}
