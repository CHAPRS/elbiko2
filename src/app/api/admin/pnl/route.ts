import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Ключ месяца по локальной дате сервера
function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// GET - Помесячный отчёт P&L (доходы по источникам, расходы, прибыль)
// Параметры:
//   months=N — последние N месяцев (по умолчанию 12, максимум 36, 0 = всё время)
//   from=YYYY-MM&to=YYYY-MM — произвольный диапазон месяцев (приоритетнее months)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();

    const parseMonth = (v: string | null): Date | null => {
      const m = v && /^(\d{4})-(\d{2})$/.exec(v);
      if (!m) return null;
      const d = new Date(Number(m[1]), Number(m[2]) - 1, 1);
      return isNaN(d.getTime()) ? null : d;
    };

    const fromMonth = parseMonth(searchParams.get('from'));
    const toMonth = parseMonth(searchParams.get('to'));
    const customRange = Boolean(fromMonth && toMonth && fromMonth <= toMonth);

    const monthsParam = Number(searchParams.get('months'));
    const allTime = !customRange && searchParams.get('months') === '0';
    const months = Number.isFinite(monthsParam) && monthsParam > 0
      ? Math.min(Math.floor(monthsParam), 36)
      : 12;

    const rangeStart = customRange
      ? fromMonth!
      : allTime
        ? new Date(2000, 0, 1)
        : new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    // Для произвольного диапазона — эксклюзивная граница (первый день месяца после `to`)
    const rangeEnd = customRange
      ? new Date(toMonth!.getFullYear(), toMonth!.getMonth() + 1, 1)
      : null;

    const period = rangeEnd
      ? { gte: rangeStart, lt: rangeEnd }
      : { gte: rangeStart };

    const [rentTx, miscTx, buyoutPayments] = await Promise.all([
      // Денежный журнал аренд: реальные поступления/возвраты по дате операции
      prisma.rentTransaction.findMany({
        where: { type: { in: ['PAYMENT', 'REFUND'] }, createdAt: period },
        select: { type: true, amount: true, createdAt: true },
      }),
      prisma.miscTransaction.findMany({
        where: { createdAt: period },
        select: { kind: true, amount: true, createdAt: true },
      }),
      prisma.buyoutPayment.findMany({
        where: { status: 'PAID', paidAt: { not: null, ...period } },
        select: { amount: true, paidAt: true },
      }),
    ]);

    interface MonthRow {
      month: string;
      rent: number;
      misc: number;
      buyout: number;
      income: number;
      expenses: number;
      profit: number;
      paymentsCount: number;
    }

    const rows = new Map<string, MonthRow>();
    const row = (d: Date): MonthRow => {
      const key = monthKey(d);
      let r = rows.get(key);
      if (!r) {
        r = { month: key, rent: 0, misc: 0, buyout: 0, income: 0, expenses: 0, profit: 0, paymentsCount: 0 };
        rows.set(key, r);
      }
      return r;
    };

    rentTx.forEach((t) => {
      const r = row(t.createdAt);
      r.rent += t.type === 'PAYMENT' ? Number(t.amount) : -Number(t.amount);
      if (t.type === 'PAYMENT') r.paymentsCount += 1;
    });
    miscTx.forEach((tx) => {
      const r = row(tx.createdAt);
      if (tx.kind === 'INCOME') r.misc += Number(tx.amount);
      else if (tx.kind === 'EXPENSE') r.expenses += Number(tx.amount);
    });
    buyoutPayments.forEach((bp) => {
      if (!bp.paidAt) return;
      const r = row(bp.paidAt);
      r.buyout += Number(bp.amount);
      r.paymentsCount += 1;
    });

    // Заполняем все месяцы диапазона (включая пустые), чтобы история была видна
    if (!allTime) {
      const fillEnd = rangeEnd ? new Date(rangeEnd.getTime() - 1) : now;
      const cursor = new Date(rangeStart);
      while (cursor <= fillEnd) {
        row(cursor);
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }

    const monthsList = Array.from(rows.values())
      .map((r) => {
        r.income = r.rent + r.misc + r.buyout;
        r.profit = r.income - r.expenses;
        return r;
      })
      .sort((a, b) => b.month.localeCompare(a.month));

    const totals = monthsList.reduce(
      (acc, r) => {
        acc.rent += r.rent;
        acc.misc += r.misc;
        acc.buyout += r.buyout;
        acc.income += r.income;
        acc.expenses += r.expenses;
        acc.profit += r.profit;
        acc.paymentsCount += r.paymentsCount;
        return acc;
      },
      { rent: 0, misc: 0, buyout: 0, income: 0, expenses: 0, profit: 0, paymentsCount: 0 }
    );

    return NextResponse.json({ months: monthsList, totals });
  } catch (error) {
    console.error('Ошибка GET /api/admin/pnl:', error);
    return NextResponse.json(
      { error: 'Не удалось сформировать отчёт' },
      { status: 500 }
    );
  }
}
