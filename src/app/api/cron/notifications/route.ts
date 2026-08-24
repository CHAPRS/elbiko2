import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET() {
  try {
    const activeRents = await prisma.rent.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: true,
        bike: true,
      },
    });

    const now = new Date();
    let sentCount = 0;

    for (const rent of activeRents) {
      if (!rent.user.telegramChatId) {
        continue;
      }

      const diffHours = (now.getTime() - new Date(rent.createdAt).getTime()) / (1000 * 60 * 60);
      const hoursLeft = 24 - (diffHours % 24);

      // Алерт за ~3 часа до конца расчетных суток
      if (hoursLeft < 2.5 || hoursLeft > 3.5) {
        continue;
      }

      const message =
        `⚠️ <b>Внимание, шеринг ЭльБайко!</b>\n\n` +
        `До автоматического списания средств за следующие сутки аренды велосипеда ` +
        `<b>${rent.bike.name}</b> осталось около 3 часов.\n\n` +
        `Если вы хотите завершить аренду, сдайте байк через личный кабинет до наступления расчетного часа.`;

      const sent = await sendTelegramMessage(rent.user.telegramChatId, message);
      if (sent) sentCount++;
    }

    return NextResponse.json({ success: true, notificationsSent: sentCount });
  } catch (error) {
    console.error('Ошибка в крон-нотификациях:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  }
}
