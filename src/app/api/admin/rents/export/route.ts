import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function escapeCsv(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[";\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return '';
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Активна',
  RETURNED: 'Возвращена',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена',
  OVERDUE: 'Просрочена',
};

// GET /api/admin/rents/export — выгрузка всех аренд с контактами клиентов
export async function GET() {
  try {
    const rents = await prisma.rent.findMany({
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            telegramChatId: true,
            maxChatId: true,
            preferredMessenger: true,
          },
        },
        bike: { select: { name: true, externalId: true } },
        rentTransactions: { select: { type: true, amount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = [
      'ID', 'Клиент', 'Телефон', 'Telegram ID', 'MAX ID', 'Мессенджер',
      'Байк', 'ID байка', 'Старт', 'Окончание', 'Факт. возврат', 'Статус',
      'Сумма', 'Штрафы', 'Оплачено', 'Долг', 'Срок погашения', 'Комментарий',
    ];
    const lines = [header.map(escapeCsv).join(';')];

    for (const r of rents) {
      const paid = r.rentTransactions.reduce(
        (sum, t) =>
          sum +
          (t.type === 'PAYMENT' ? Number(t.amount) : t.type === 'REFUND' ? -Number(t.amount) : 0),
        0
      );
      const penalties = r.rentTransactions.reduce(
        (sum, t) => sum + (t.type === 'PENALTY' ? Number(t.amount) : 0),
        0
      );
      const debt = Math.max(0, Number(r.totalPrice) + penalties - paid);

      lines.push(
        [
          r.id,
          r.user.name,
          r.user.phone,
          r.user.telegramChatId ?? '',
          r.user.maxChatId ?? '',
          r.user.preferredMessenger ?? '',
          r.bike?.name ?? '',
          r.bike?.externalId ?? '',
          fmtDate(r.startDate),
          fmtDate(r.endDate),
          fmtDate(r.actualReturnDate),
          STATUS_LABELS[r.status] ?? r.status,
          Number(r.totalPrice),
          Math.round(penalties * 100) / 100,
          Math.round(paid * 100) / 100,
          Math.round(debt * 100) / 100,
          fmtDate(r.debtDueDate),
          r.comment ?? '',
        ].map(escapeCsv).join(';')
      );
    }

    const csv = '﻿' + lines.join('\r\n');
    const fileName = `rents_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Ошибка экспорта аренд:', error);
    return NextResponse.json({ error: 'Не удалось выгрузить аренды' }, { status: 500 });
  }
}
