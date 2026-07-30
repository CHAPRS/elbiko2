import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { phone, chatId } = await request.json();

    if (!phone || !chatId) {
      return NextResponse.json({ error: 'Не передан phone или chatId' }, { status: 400 });
    }

    // Приводим номера к единому стандарту, если бот присылает с '+'
    const cleanPhone = phone.replace('+', '');

    const user = await prisma.user.findFirst({
      where: { phone: cleanPhone }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Курьер с таким номером телефона не зарегистрирован в системе шеринга' }, 
        { status: 404 }
      );
    }

    // Сохраняем chatId напрямую
    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: String(chatId) }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Telegram привязан к профилю ${cleanPhone}` 
    });

  } catch (error) {
    console.error('Ошибка Telegram API:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
