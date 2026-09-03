import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRent } from '@/lib/rent';
import { sendTelegramNotification } from '@/lib/telegram';
import { escapeHtml } from '@/lib/html';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = body.clientPhone || body.phone;
    const name = body.clientName || body.name || 'Клиент с сайта';
    const bikeId = body.bikeId;
    const days = Number(body.days) > 0 ? Number(body.days) : 1;

    if (!phone || !bikeId) {
      return NextResponse.json(
        { error: 'Телефон и ID байка обязательны для бронирования' },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { phone: String(phone) },
      update: { name },
      create: { phone: String(phone), name },
    });

    const rent = await createRent({ userId: user.id, bikeId: Number(bikeId), days });

    const bike = await prisma.bike.findUnique({ where: { id: Number(bikeId) } });

    const notificationText = [
      '⚡ <b>Новая аренда</b>',
      '────────────────────────',
      `👤 Клиент: ${escapeHtml(user.name || 'Клиент с сайта')}`,
      `📞 Телефон: ${escapeHtml(String(phone))}`,
      `🚲 Велосипед: ${escapeHtml(bike?.name || 'не выбран')}`,
      `📅 Дней: ${days}`,
      `💰 Сумма: ${rent.totalPrice} ₽`,
      `🆔 Аренда #${rent.id}`,
    ]
      .filter(Boolean)
      .join('\n');

    sendTelegramNotification(notificationText).catch((error) => {
      console.error('Ошибка отправки Telegram при аренде:', error);
    });

    return NextResponse.json({ success: true, rentId: rent.id, totalPrice: rent.totalPrice });
  } catch (error: any) {
    console.error('Ошибка при создании аренды:', error);
    return NextResponse.json(
      { error: error.message || 'Не удалось оформить аренду' },
      { status: 400 }
    );
  }
}
