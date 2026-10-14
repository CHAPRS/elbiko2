import { prisma } from '@/lib/prisma';
import { sendNotification } from '@/lib/messenger';

export interface MarkOverdueResult {
  count: number;
  rentIds: number[];
  batteryRentIds: number[];
}

const USER_SELECT = {
  id: true,
  name: true,
  phone: true,
  telegramChatId: true,
  maxChatId: true,
  preferredMessenger: true,
} as const;

export async function markOverdueRents(): Promise<MarkOverdueResult> {
  const now = new Date();

  const overdueRents = await prisma.rent.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: now },
    },
    include: {
      user: { select: USER_SELECT },
      bike: {
        select: { id: true, name: true },
      },
    },
  });

  const overdueBatteryRents = await prisma.batteryRent.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: now },
    },
    include: {
      user: { select: USER_SELECT },
      battery: {
        select: { id: true, name: true },
      },
    },
  });

  const rentIds: number[] = [];
  const batteryRentIds: number[] = [];
  const contactsUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/contacts`;

  for (const rent of overdueRents) {
    await prisma.rent.update({
      where: { id: rent.id },
      data: { status: 'OVERDUE', isActive: false },
    });

    rentIds.push(rent.id);

    const endDate = new Date(rent.endDate).toLocaleDateString('ru-RU');
    const text = `Срок аренды ${rent.bike.name} истёк ${endDate}. Пожалуйста, свяжитесь с диспетчером: ${contactsUrl}`;

    try {
      await sendNotification(rent.user, text);
    } catch (err) {
      console.error('Failed to send overdue notification:', err);
    }
  }

  for (const rent of overdueBatteryRents) {
    await prisma.batteryRent.update({
      where: { id: rent.id },
      data: { status: 'OVERDUE', isActive: false },
    });

    batteryRentIds.push(rent.id);

    const endDate = new Date(rent.endDate).toLocaleDateString('ru-RU');
    const text = `Срок аренды аккумулятора ${rent.battery.name} истёк ${endDate}. Пожалуйста, свяжитесь с диспетчером: ${contactsUrl}`;

    try {
      await sendNotification(rent.user, text);
    } catch (err) {
      console.error('Failed to send overdue notification:', err);
    }
  }

  return {
    count: overdueRents.length + overdueBatteryRents.length,
    rentIds,
    batteryRentIds,
  };
}
