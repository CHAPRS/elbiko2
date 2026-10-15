import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password';

const prisma = new PrismaClient();

async function main() {
  console.log('Начало наполнения базы данных (Seeding)...');

  await prisma.payment.deleteMany({});
  await prisma.rent.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.rentalSession.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.bike.deleteMany({});

  const bikes = await Promise.all([
    prisma.bike.create({
      data: {
        name: 'Monster Long Range',
        speed: 'до 50 км/ч',
        range: 'до 80 км',
        motor: '500W',
        isWaterproof: true,
        status: 'RENTED',
        pricePerDay: 500,
      },
    }),
    prisma.bike.create({
      data: {
        name: 'City Courier 48V',
        speed: 'до 45 км/ч',
        range: 'до 60 км',
        motor: '350W',
        isWaterproof: false,
        status: 'FREE',
        pricePerDay: 450,
      },
    }),
    prisma.bike.create({
      data: {
        name: 'Storm Pro',
        speed: 'до 55 км/ч',
        range: 'до 100 км',
        motor: '750W',
        isWaterproof: true,
        status: 'MAINTENANCE',
        pricePerDay: 650,
      },
    }),
  ]);
  console.log(`✅ Создано велосипедов: ${bikes.length}`);

  const hashedPassword = await hashPassword('courier-password-2026');

  const courier = await prisma.user.create({
    data: {
      phone: '+79991112233',
      password: hashedPassword,
      name: 'Иван Курьер',
      balance: 1500.0,
    },
  });
  console.log('✅ Тестовый курьер создан:', courier.phone);

  const activeSession = await prisma.rentalSession.create({
    data: {
      tariff: 'WEEKLY',
      status: 'ACTIVE',
      userId: courier.id,
      bikeId: bikes[0].id,
      startDate: new Date(),
    },
  });
  console.log('✅ Активная сессия аренды запущена, ID:', activeSession.id);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);

  const rent = await prisma.rent.create({
    data: {
      userId: courier.id,
      bikeId: bikes[0].id,
      endDate,
      totalPrice: 3500,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Активная аренда создана, ID:', rent.id);

  await prisma.lead.createMany({
    data: [
      {
        name: 'Пётр Доставкин',
        phone: '+79005553311',
        bikeName: bikes[1].name,
        bikeId: bikes[1].id,
        message: 'Нужен байк на месяц, работаю в Яндекс Еде',
        status: 'NEW',
      },
      {
        name: 'Алексей Самокатов',
        phone: '+79005554422',
        bikeName: bikes[2].name,
        status: 'IN_PROGRESS',
      },
    ],
  });
  console.log('✅ Тестовые заявки созданы');

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
