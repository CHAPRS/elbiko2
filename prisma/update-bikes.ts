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
  const keepIds = new Set<number>();

  for (const bike of targetBikes) {
    const targetKey = normalizeName(bike.name);
    const existing = allBikes.find((b) => normalizeName(b.name) === targetKey);

    if (existing) {
      const updated = await prisma.bike.update({
        where: { id: existing.id },
        data: { ...bike, status: 'FREE' as const },
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

  // Все остальные байки (дубли, City Courier и пр.) скрываем из каталога
  const hidden = await prisma.bike.updateMany({
    where: { id: { notIn: Array.from(keepIds) } },
    data: { status: 'MAINTENANCE' },
  });

  if (hidden.count > 0) {
    console.log(`Скрыто лишних моделей: ${hidden.count}`);
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
