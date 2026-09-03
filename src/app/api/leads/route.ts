import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';
import { limiter } from '@/lib/rate-limit';
import { createLeadSchema } from '@/lib/validation';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Заменяем Request на NextRequest для работы с IP
export async function POST(request: NextRequest) {
  // 1. Получаем IP-адрес пользователя для проверки лимитов
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    // 2. Ограничиваем частоту: максимум 3 заявки в минуту с одного IP
    await limiter.check(3, ip);
  } catch (error) {
    return NextResponse.json(
      { error: 'Слишком много попыток. Пожалуйста, подождите 1 минуту перед отправкой новой заявки.' },
      { 
        status: 429,
        headers: { 'Retry-After': '60' }
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = createLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: parsed.error.format() },
        { status: 400 }
      );
    }

    // 3. Создаем запись в MySQL через Prisma
    const lead = await prisma.lead.create({
      data: {
        ...parsed.data,
        bikeId: parsed.data.bikeId ?? null,
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

    // 4. Оптимизация Telegram: убираем await, чтобы ответ клиенту улетал мгновенно.
    // Запускаем отправку в фоновом режиме. Ошибки логируем, но юзер о них не знает.
    sendTelegramNotification(notificationText).catch((tgError) => {
      console.error('Фоновая ошибка отправки в Telegram:', tgError);
    });

    // Мгновенно возвращаем успешный ответ курьеру на фронтенд
    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании заявки:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
