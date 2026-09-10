import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { upsertContactByPhone } from './contact';

interface CreateRentInput {
  userId: number;
  bikeId: number;
  days?: number;
  startDate?: Date;
  endDate?: Date;
  totalPrice?: number;
}

// Оформление аренды: бронь байка, запись аренды и ожидающий платёж создаются атомарно
export async function createRent({ userId, bikeId, days, startDate, endDate, totalPrice: explicitTotalPrice }: CreateRentInput) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const bike = await tx.bike.findUnique({ where: { id: bikeId } });

    if (!bike) {
      throw new Error('Велосипед не найден');
    }

    if (bike.status !== 'FREE') {
      throw new Error('Велосипед недоступен: он уже в аренде или на сервисе');
    }

    const start = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : new Date(start);
    if (!endDate && days && days > 0) {
      finalEndDate.setDate(finalEndDate.getDate() + days);
    }

    const totalPrice = explicitTotalPrice ?? Number(bike.pricePerDay) * (days || 1);

    await tx.bike.update({
      where: { id: bike.id },
      data: { status: 'RENTED' },
    });

    const rent = await tx.rent.create({
      data: {
        userId,
        bikeId: bike.id,
        startDate: start,
        endDate: finalEndDate,
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

export async function createRentAndMarkContact(input: CreateRentInput & { fullName: string; phone: string }) {
  const rent = await createRent(input);

  await upsertContactByPhone({
    fullName: input.fullName,
    phone: input.phone,
    status: 'CUSTOMER',
    source: 'RENT',
  });

  return rent;
}
