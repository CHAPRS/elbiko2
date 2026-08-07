import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, bikeName, bikeId, message } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name: String(name),
        phone: String(phone),
        bikeName: bikeName ? String(bikeName) : null,
        bikeId: bikeId ? Number(bikeId) : null,
        message: message ? String(message) : null,
        status: 'NEW',
      },
    });

    const notificationText = [
      '🔥 <b>Новая заявка с сайта</b>',
      '────────────────────────',
      `👤 Клиент: ${escapeHtml(lead.name)}`,
      `📞 Телефон: ${escapeHtml(lead.phone)}`,
      `🚲 Велосипед: ${escapeHtml(lead.bikeName || 'не выбран')}`,
      lead.message ? `📝 Сообщение: ${escapeHtml(lead.message)}` : null,
      '────────────────────────',
      `🆔 Заявка #${lead.id}`,
    ]
      .filter(Boolean)
      .join('\n');

    // Заявка уже сохранена, поэтому сбой Telegram не должен ломать ответ клиенту
    const notified = await sendTelegramNotification(notificationText);

    return NextResponse.json({ success: true, leadId: lead.id, notified }, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании заявки:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
