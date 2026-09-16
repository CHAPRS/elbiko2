import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targetBikes = [
  {
    name: 'Wenbox U6 PRO',
    speed: 'до 60 км/ч',
    range: 'до 60 км',
    motor: '1500W (в документах 240w)',
    battery: '30 Ah',
    isWaterproof: true,
    status: 'FREE',
    pricePerDay: 457,
    imageUrl: '/images/wenbox-u6.webp',
  },
  {
    name: 'WENBOX U1 Pro',
    speed: 'до 60 км/ч',
    range: 'до 80 км',
    motor: '1500W (в документах 240w)',
    battery: '45 Ah',
    isWaterproof: true,
    status: 'FREE',
    pricePerDay: 500,
    imageUrl: '/images/wenbox-u1-pro.webp',
  },
];

function normalizeName(name?: string | null): string {
  return (name || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  // Загружаем все байки один раз, чтобы искать по нормализованному названию
  const allBikes = await prisma.bike.findMany();
  const activeRents = await prisma.rent.findMany({
    where: { status: { in: ['ACTIVE', 'OVERDUE'] } },
    select: { bikeId: true },
  });
  const rentedBikeIds = new Set(activeRents.map((r) => r.bikeId));
  const keepIds = new Set<number>();

  // 1. Upsert целевых моделей: обновляем характеристики, сохраняем текущий статус
  for (const bike of targetBikes) {
    const targetKey = normalizeName(bike.name);
    const existing = allBikes.find((b) => normalizeName(b.name) === targetKey);

    if (existing) {
      const { status: _, ...bikeData } = bike;
      const updated = await prisma.bike.update({
        where: { id: existing.id },
        data: bikeData,
      });
      keepIds.add(updated.id);
      console.log(`Обновлён: ${bike.name} (id=${updated.id})`);
    } else {
      const created = await prisma.bike.create({
        data: { ...bike, status: 'FREE' as const },
      });
      keepIds.add(created.id);
      console.log(`Создан: ${bike.name} (id=${created.id})`);
    }
  }

  // 2. Сверка + скрытие лишних моделей по актуальным арендам
  const freshBikes = await prisma.bike.findMany();
  let hiddenCount = 0;
  let reconciledCount = 0;

  for (const bike of freshBikes) {
    const hasActiveRent = rentedBikeIds.has(bike.id);
    const isTarget = keepIds.has(bike.id);
    let newStatus = bike.status;

    if (hasActiveRent && bike.status !== 'RENTED') {
      newStatus = 'RENTED';
    } else if (!hasActiveRent && !isTarget && bike.status !== 'MAINTENANCE' && bike.status !== 'BLOCKED') {
      newStatus = 'MAINTENANCE';
    } else if (!hasActiveRent && bike.status !== 'FREE' && bike.status !== 'MAINTENANCE' && bike.status !== 'BLOCKED') {
      newStatus = 'FREE';
    }

    if (newStatus !== bike.status) {
      await prisma.bike.update({
        where: { id: bike.id },
        data: { status: newStatus },
      });
      if (hasActiveRent || isTarget) reconciledCount++;
      else hiddenCount++;
    }
  }

  if (hiddenCount > 0) {
    console.log(`Скрыто лишних моделей: ${hiddenCount}`);
  }
  if (reconciledCount > 0) {
    console.log(`Сверка статусов: обновлено ${reconciledCount} байков`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
