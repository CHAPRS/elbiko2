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

function formatDateTimeRu(d: Date): string {
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Наличные',
  SBP: 'СБП',
  CARD: 'Карта',
  TRANSFER: 'Перевод',
};

const CATEGORY_LABELS: Record<string, string> = {
  REPAIR: 'Ремонт',
  SERVICE: 'ТО',
  BATTERY: 'Аккумулятор',
  BATTERY_RENT: 'Аренда аккумулятора',
  ACCESSORIES: 'Аксессуары',
  GOODS: 'Сопутствующие товары',
  PARTS: 'Запчасти',
  SALARY: 'ЗП мастерам',
  DELIVERY: 'Доставка',
  TOOLS: 'Оборудование/инструменты',
  OTHER: 'Прочее',
};

// GET /api/admin/finance/export?from=YYYY-MM-DD&to=YYYY-MM-DD
// Единый финансовый журнал за период: аренды байков, АКБ, прочие операции, выкупы
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const to = toParam ? new Date(toParam) : new Date();
    to.setHours(23, 59, 59, 999);
    const from = fromParam ? new Date(fromParam) : new Date(to);
    if (!fromParam) from.setDate(from.getDate() - 29);
    from.setHours(0, 0, 0, 0);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return NextResponse.json({ error: 'Некорректные даты периода' }, { status: 400 });
    }

    const [rentTx, batteryTx, miscTx, buyoutPaid] = await Promise.all([
      prisma.rentTransaction.findMany({
        where: { type: { in: ['PAYMENT', 'REFUND'] }, createdAt: { gte: from, lte: to } },
        select: {
          type: true,
          amount: true,
          method: true,
          comment: true,
          createdAt: true,
          rentId: true,
          rent: { select: { user: { select: { name: true } } } },
        },
      }),
      prisma.batteryRentTransaction.findMany({
        where: { type: { in: ['PAYMENT', 'REFUND'] }, createdAt: { gte: from, lte: to } },
        select: {
          type: true,
          amount: true,
          method: true,
          comment: true,
          createdAt: true,
          batteryRentId: true,
          batteryRent: { select: { user: { select: { name: true } } } },
        },
      }),
      prisma.miscTransaction.findMany({
        where: { createdAt: { gte: from, lte: to } },
        include: { bike: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.buyoutPayment.findMany({
        where: { status: 'PAID', paidAt: { gte: from, lte: to } },
        select: {
          amount: true,
          method: true,
          comment: true,
          paidAt: true,
          buyout: { select: { title: true, clientName: true } },
        },
      }),
    ]);

    type Row = {
      date: Date;
      source: string;
      subject: string;
      category: string;
      kind: string;
      amount: number;
      method: string;
      comment: string;
    };

    const rows: Row[] = [];

    for (const t of rentTx) {
      const isRefund = t.type === 'REFUND';
      rows.push({
        date: t.createdAt,
        source: 'Аренда байка',
        subject: `Аренда #${t.rentId}${t.rent?.user?.name ? ` · ${t.rent.user.name}` : ''}${isRefund ? ' · возврат' : ''}`,
        category: 'Аренда',
        kind: isRefund ? 'Расход' : 'Доход',
        amount: Number(t.amount),
        method: t.method ? METHOD_LABELS[t.method] ?? t.method : '',
        comment: t.comment ?? '',
      });
    }

    for (const t of batteryTx) {
      const isRefund = t.type === 'REFUND';
      rows.push({
        date: t.createdAt,
        source: 'Аренда АКБ',
        subject: `Аренда АКБ #${t.batteryRentId}${t.batteryRent?.user?.name ? ` · ${t.batteryRent.user.name}` : ''}${isRefund ? ' · возврат' : ''}`,
        category: 'Аренда аккумулятора',
        kind: isRefund ? 'Расход' : 'Доход',
        amount: Number(t.amount),
        method: t.method ? METHOD_LABELS[t.method] ?? t.method : '',
        comment: t.comment ?? '',
      });
    }

    for (const bp of buyoutPaid) {
      if (!bp.paidAt) continue;
      rows.push({
        date: bp.paidAt,
        source: 'Выкуп',
        subject: `${bp.buyout.title}${bp.buyout.clientName ? ` · ${bp.buyout.clientName}` : ''}`,
        category: 'Выкуп',
        kind: 'Доход',
        amount: Number(bp.amount),
        method: bp.method ? METHOD_LABELS[bp.method] ?? bp.method : '',
        comment: bp.comment ?? '',
      });
    }

    for (const tx of miscTx) {
      const isIncome = tx.kind === 'INCOME';
      rows.push({
        date: tx.createdAt,
        source: 'Прочие операции',
        subject: `${tx.title}${tx.bike?.name ? ` · ${tx.bike.name}` : ''}`,
        category: tx.category ? CATEGORY_LABELS[tx.category] ?? tx.category : '',
        kind: isIncome ? 'Доход' : 'Расход',
        amount: Number(tx.amount),
        method: tx.method ? METHOD_LABELS[tx.method] ?? tx.method : '',
        comment: tx.comment ?? '',
      });
    }

    rows.sort((a, b) => a.date.getTime() - b.date.getTime());

    const header = ['Дата', 'Источник', 'Предмет', 'Категория', 'Тип', 'Сумма', 'Способ оплаты', 'Комментарий'];
    const lines = [header.map(escapeCsv).join(';')];
    for (const r of rows) {
      lines.push(
        [
          formatDateTimeRu(r.date),
          r.source,
          r.subject,
          r.category,
          r.kind,
          r.amount,
          r.method,
          r.comment,
        ].map(escapeCsv).join(';')
      );
    }

    const csv = '﻿' + lines.join('\r\n');
    const fileName = `finance_${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Ошибка экспорта финансового журнала:', error);
    return NextResponse.json({ error: 'Не удалось выгрузить журнал' }, { status: 500 });
  }
}
