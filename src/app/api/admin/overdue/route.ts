import { NextResponse } from 'next/server';
import { markOverdueRents } from '@/lib/overdue';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await markOverdueRents();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка POST /api/admin/overdue:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
