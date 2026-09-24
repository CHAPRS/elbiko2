import { NextResponse } from 'next/server';
import { markOverdueRents } from '@/lib/overdue';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = request.headers.get('Authorization');
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : '';

  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json(
      { error: 'Требуется авторизация cron' },
      { status: 401 }
    );
  }

  try {
    const result = await markOverdueRents();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка cron /overdue:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
