import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function GET(request: Request) {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: 'Токен Telegram не настроен в .env' }, { status: 500 });
    }

    // Запрашиваем все аренды, убирая "where: { status }", чтобы не было ошибок компиляции!
    const allRents = await prisma.rent.findMany({
      include: {
        user: true,
        bike: true
      }
    });

    const now = new Date();
    let sentCount = 0;

    for (const rent of allRents) {
      // 1. Приводим запись к типу any, чтобы безопасно читать любые динамические поля
      const rentData = rent as any;

      // 2. Проверяем статус записи на чистом JS (игнорируем регистр и тип в базе)
      const currentStatus = String(rentData.status || '').toUpperCase();
      if (currentStatus !== 'ACTIVE') {
        continue; // Пропускаем завершенные или ожидающие аренды
      }

      // 3. Достаем связанные объекты пользователя и байка
      const currentUser = rentData.user;
      const currentBike = rentData.bike;

      // Если у курьера нет привязанного Telegram Chat ID — пропускаем
      if (!currentUser || !currentUser.telegramChatId) {
        continue;
      }

      const rentStart = new Date(rent.createdAt);
      const diffMs = now.getTime() - rentStart.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      const hoursInCurrentDay = diffHours % 24;
      const hoursLeft = 24 - hoursInCurrentDay;

      // Отправляем алерт за 3 часа до конца расчетных суток
      if (hoursLeft >= 2.5 && hoursLeft <= 3.5) {
        const bikeTitle = currentBike?.title || 'Электровелосипед';
        const message = `⚠️ *Внимание, шеринг EBIKE-RENT!*\n\nДо автоматического списания средств за следующие сутки аренды велосипеда *${bikeTitle}* осталось около 3 часов.\n\nЕсли вы хотите завершить аренду, сдайте байк через Личный кабинет до наступления расчетного часа.`;

        await fetch(`https://telegram.org{TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: currentUser.telegramChatId,
            text: message,
            parse_mode: 'Markdown'
          })
        });

        sentCount++;
      }
    }

    return NextResponse.json({ success: true, notificationsSent: sentCount });

  } catch (error) {
    console.error('Ошибка в Крон-нотификациях:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  }
}
