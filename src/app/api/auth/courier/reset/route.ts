import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Укажите номер телефона' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      // Не раскрываем, есть ли такой телефон
      return NextResponse.json({ success: true });
    }

    if (!user.telegramChatId) {
      return NextResponse.json(
        { error: 'Telegram не подключен. Обратитесь к администратору' },
        { status: 400 }
      );
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCode: code,
        passwordResetCodeExpiresAt: expiresAt,
      },
    });

    await sendTelegramMessage(
      user.telegramChatId,
      `Код для установки пароля Elbiko: <b>${code}</b>\n\nЕсли это не вы — проигнорируйте сообщение.`,
      'HTML'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка отправки кода:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
