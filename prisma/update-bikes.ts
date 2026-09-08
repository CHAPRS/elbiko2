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
  },
];

async function main() {
  for (const bike of targetBikes) {
    const existing = await prisma.bike.findFirst({
      where: { name: bike.name },
    });

    if (existing) {
      await prisma.bike.update({
        where: { id: existing.id },
        data: bike,
      });
      console.log(`Обновлён: ${bike.name}`);
    } else {
      await prisma.bike.create({ data: bike });
      console.log(`Создан: ${bike.name}`);
    }
  }

  // Остальные велосипеды (например, City Courier 48V) скрываем из каталога
  const updated = await prisma.bike.updateMany({
    where: { name: { notIn: targetBikes.map((b) => b.name) } },
    data: { status: 'MAINTENANCE' },
  });

  if (updated.count > 0) {
    console.log(`Скрыто лишних моделей: ${updated.count}`);
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
