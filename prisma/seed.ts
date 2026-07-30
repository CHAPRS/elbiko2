import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== [SEED] Очистка старых данных... ===');
  
  // Безопасное удаление: если таблиц нет, скрипт не упадет, а просто пойдет дальше
  try { await prisma.rent.deleteMany({}); } catch (e) {}
  try { await prisma.bike.deleteMany({}); } catch (e) {}
  try { await prisma.user.deleteMany({}); } catch (e) {}

  console.log('=== [SEED] Наполнение базы данных MySQL... ===');


  // 1. Создаем тестовых пользователей (курьеров)
  const user1 = await prisma.user.create({
    data: {
      phone: '+7 (999) 111-22-33',
      telegramChatId: '548930211',
    },
  });

  await prisma.user.create({
    data: {
      phone: '+7 (999) 444-55-66',
      telegramChatId: null,
    },
  });

   // 2. Создаем электровелосипеды в разных статусах, совместимых с БД и фронтендом
  const bike1 = await prisma.bike.create({
    data: {
      name: 'Minako V12 2026 Pro', // Объединили имя и модель
      motor: '500W',
      speed: '45 км/ч',
      range: 'до 60 км',
      isWaterproof: true,
      pricePerDay: 500,
      status: 'RENTED',
    },
  });

  await prisma.bike.create({
    data: {
      name: 'Monster Monster 2026 Edition',
      motor: '1000W',
      speed: '55 км/ч',
      range: 'до 80 км',
      isWaterproof: true,
      pricePerDay: 700,
      status: 'FREE',
    },
  });

  await prisma.bike.create({
    data: {
      name: 'Wenbo Pro 2025 Urban',
      motor: '450W',
      speed: '40 км/ч',
      range: 'до 50 км',
      isWaterproof: true,
      pricePerDay: 450,
      status: 'FREE',
    },
  });

  await prisma.bike.create({
    data: {
      name: 'Minako Titan Heavy Duty',
      motor: '750W',
      speed: '42 км/ч',
      range: 'до 70 км',
      isWaterproof: false,
      pricePerDay: 600,
      status: 'MAINTENANCE',
    },
  });

  // Вычисляем дату окончания аренды (текущая дата + 14 дней)
  const targetEndDate = new Date();
  targetEndDate.setDate(targetEndDate.getDate() + 14);

  // 3. Создаем активную аренду с заполнением обязательных полей endDate и totalPrice
  // Принудительно приводим к "as any" для защиты от любых конфликтов схем
  const rentPayload: any = {
    isActive: true,
    endDate: targetEndDate,
    totalPrice: 7000, // 500 руб * 14 дней
    user: {
      connect: { id: user1.id }
    },
    bike: {
      connect: { id: bike1.id }
    }
  };

  await prisma.rent.create({
    data: rentPayload
  });

  console.log('=== [SEED SUCCESS] База данных успешно заполнена! ===');
  console.log('- Добавлено курьеров: 2');
  console.log('- Добавлено велосипедов: 4');
  console.log('- Из них свободных: 2');
  console.log('- Активных аренд: 1');
}

main()
  .catch((e) => {
    console.error('Ошибка во время сидинга:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
