import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { upsertContactByPhone } from './contact';

interface CreateBatteryRentInput {
  userId: number;
  batteryId: number;
  days?: number;
  startDate?: Date;
  endDate?: Date;
  totalPrice?: number;
}

// Оформление аренды АКБ: бронь аккумулятора и запись аренды создаются атомарно
export async function createBatteryRent({ userId, batteryId, days, startDate, endDate, totalPrice: explicitTotalPrice }: CreateBatteryRentInput) {
  return prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
    const battery = await tx.battery.findUnique({ where: { id: batteryId } });

    if (!battery) {
      throw new Error('Аккумулятор не найден');
    }

    if (battery.status !== 'FREE') {
      throw new Error('Аккумулятор недоступен: он уже в аренде или на сервисе');
    }

    const start = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : new Date(start);
    let rentDays = days && days > 0 ? days : 1;

    if (!endDate && days && days > 0) {
      finalEndDate.setDate(finalEndDate.getDate() + days);
    } else if (endDate && (!days || days <= 0)) {
      const diffMs = finalEndDate.getTime() - start.getTime();
      rentDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    } else if (!endDate && (!days || days <= 0)) {
      finalEndDate.setDate(finalEndDate.getDate() + 1);
    }

    const totalPrice = explicitTotalPrice ?? Number(battery.pricePerDay) * rentDays;

    await tx.battery.update({
      where: { id: battery.id },
      data: { status: 'RENTED' },
    });

    const rent = await tx.batteryRent.create({
      data: {
        userId,
        batteryId: battery.id,
        startDate: start,
        endDate: finalEndDate,
        totalPrice,
        isActive: true,
        status: 'ACTIVE',
      },
    });

    return rent;
  },
  { maxWait: 10000, timeout: 60000 }
  );
}

export async function createBatteryRentAndMarkContact(input: CreateBatteryRentInput & { fullName: string; phone: string }) {
  const rent = await createBatteryRent(input);

  await upsertContactByPhone({
    fullName: input.fullName,
    phone: input.phone,
    status: 'CUSTOMER',
    source: 'RENT',
  });

  return rent;
}
