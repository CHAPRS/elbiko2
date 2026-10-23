import { prisma } from '@/lib/prisma';

// Синхронизация статусов парка с фактическими арендами.
// Байк/АКБ с активной или просроченной арендой обязан быть RENTED —
// иначе он «протекает» в списки свободных (автопарк, каталог, селекты).
// Идемпотентно: обновляет только расхождения. Не трогает обратное
// направление (RENTED без аренды может быть ручной бронью диспетчера).
export async function reconcileFleetStatuses() {
  const [bikesFixed, batteriesFixed] = await Promise.all([
    prisma.bike.updateMany({
      where: {
        status: { not: 'RENTED' },
        rents: { some: { status: { in: ['ACTIVE', 'OVERDUE'] } } },
      },
      data: { status: 'RENTED' },
    }),
    prisma.battery.updateMany({
      where: {
        status: { not: 'RENTED' },
        rents: { some: { status: { in: ['ACTIVE', 'OVERDUE'] } } },
      },
      data: { status: 'RENTED' },
    }),
  ]);

  return { bikesFixed: bikesFixed.count, batteriesFixed: batteriesFixed.count };
}
