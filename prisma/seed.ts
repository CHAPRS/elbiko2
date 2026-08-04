import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Начало наполнения базы данных (Seeding)...');

  // 1. Очищаем старые данные (опционально, чтобы избежать дубликатов при повторном запуске)
  await prisma.rentalSession.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.bike.deleteMany({});

  // 2. Создаем тестовый электровелосипед по новому стандарту (v3.3)
  const sampleBike = await prisma.bike.create({
    data: {
      speed: '50 км/ч',
      range: '80 км',
      motor: '500W',
      isWaterproof: true,
      status: 'RENTED', // Статус "Арендован"
    },
  });
  console.log('✅ Тестовый велосипед создан:', sampleBike.id);

  // 3. Создаем тестового курьера
  const sampleCourier = await prisma.user.create({
    data: {
      phone: '+79991112233',
      password: 'courier-password-2026', // Обязательное поле теперь заполнено
      name: 'Иван Курьер',
      balance: 1500.00, // Начальный баланс курьера
    },
  });
  console.log('✅ Тестовый курьер создан:', sampleCourier.phone);

  // 4. Закрепляем велосипед за курьером, создавая активную сессию аренды
  const activeSession = await prisma.rentalSession.create({
    data: {
      tariff: 'WEEKLY',
      status: 'ACTIVE',
      userId: sampleCourier.id,
      bikeId: sampleBike.id,
      startDate: new Date(),
    },
  });
  console.log('✅ Активная сессия аренды успешно запущена! ID:', activeSession.id);

  console.log('Наполнение базы данных успешно завершено!');
}

main()
  .catch((e) => {
    console.error('Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
