import { NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const { phone, bikeId, description, location } = await request.json();

    const telegramMessage = `
🚨 <b>ПОЛОМКА НА СТРОКЕ!</b>
📱 <b>Курьер:</b> ${phone}
🚲 <b>Байк:</b> ${bikeId}
📝 <b>Что случилось:</b> ${description}
📍 <b>Локация:</b> ${location}
    `.trim();

    await sendTelegramNotification(telegramMessage);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
