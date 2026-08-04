import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, bikeName } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 });
    }

    const TELEGRAM_TOKEN = '8653805854:AAHoAngkcdhErgGCmoHn7ja-lsx1VYN_wIQ';
    const ADMIN_CHAT_ID = -1002381920381;

    const messageText = `🔥 ПОСТУПИЛА НОВАЯ ЗАЯВКА С САЙТА:\n` +
                        `────────────────────────\n` +
                        `👤 Клиент: ${name}\n` +
                        `📞 Телефон: ${phone}\n` +
                        `🚲 Велосипед: ${bikeName}\n` +
                        `────────────────────────`;

    // Жесткий монолитный URL
    const finalUrl = `https://telegram.org{TELEGRAM_TOKEN}/sendMessage`;

    const tgRes = await fetch(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: messageText,
      }),
    });

    if (tgRes.ok) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const errData = await tgRes.json();
    console.error('Ошибка Telegram API:', errData);
    return NextResponse.json({ error: 'Ошибка Telegram API' }, { status: 500 });

  } catch (error) {
    console.error('Критическая ошибка API бронирования:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
