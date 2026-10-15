import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';
import { limiter } from '@/lib/rate-limit';
import { createLeadSchema } from '@/lib/validation';
import { upsertContactByPhone } from '@/lib/contact';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function daysBetween(start: Date, end: Date): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
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

    const { name, phone, bikeId, bikeName, message, startDate, endDate } = parsed.data;

    let rentDays: number | undefined = undefined;
    let totalPrice: number | undefined = undefined;

    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        return NextResponse.json({ error: 'Дата окончания не может быть раньше даты начала' }, { status: 400 });
      }
      rentDays = daysBetween(startDate, endDate);

      if (bikeId) {
        const bike = await prisma.bike.findUnique({ where: { id: bikeId } });
        if (bike) {
          totalPrice = Number(bike.pricePerDay) * rentDays;
        }
      }
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        bikeName: bikeName ?? null,
        bikeId: bikeId ?? null,
        message: message ?? null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        rentDays: rentDays ?? null,
        totalPrice: totalPrice ? totalPrice : null,
        status: 'NEW',
      },
    });

    await upsertContactByPhone({
      fullName: name,
      phone,
      status: 'INQUIRY',
      source: 'SITE',
      notes: message || null,
    });

    const notificationText = [
      '🔥 <b>Новая заявка с сайта</b>',
      '────────────────────────',
      `👤 Клиент: ${escapeHtml(lead.name)}`,
      `📞 Телефон: ${escapeHtml(lead.phone)}`,
      `🚲 Велосипед: ${escapeHtml(lead.bikeName || 'не выбран')}`,
      rentDays ? `📅 Дней: ${rentDays}` : null,
      totalPrice ? `💰 Итого: ${totalPrice} ₽` : null,
      lead.message ? `📝 Сообщение: ${escapeHtml(lead.message)}` : null,
      '────────────────────────',
      `🆔 Заявка #${lead.id}`,
    ]
      .filter(Boolean)
      .join('\n');

    sendTelegramNotification(notificationText).catch((tgError) => {
      console.error('Фоновая ошибка отправки в Telegram:', tgError);
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании заявки:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
