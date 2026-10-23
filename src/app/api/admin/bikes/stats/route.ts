import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function startOfDay(d: Date) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function endOfDay(d: Date) {
  const out = new Date(d);
  out.setHours(23, 59, 59, 999);
  return out;
}

function periodDays(from: Date, to: Date) {
  return Math.max(1, Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function overlapDays(start: Date, end: Date, from: Date, to: Date) {
  const s = startOfDay(start).getTime();
  const e = startOfDay(end).getTime();
  const f = from.getTime();
  const t = to.getTime();
  const overlapStart = Math.max(s, f);
  const overlapEnd = Math.min(e, t);
  if (overlapEnd < overlapStart) return 0;
  return Math.max(1, Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)));
}

function getDefaultRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from, to };
}

interface BikeStat {
  id: number;
  name: string;
  externalId: string | null;
  purchasePrice: number | null;
  purchaseDate: string | null;
  mileage: number | null;
  rentDays: number;
  rentCount: number;
  revenue: number;
  avgCheck: number;
  utilization: number;
  expenses: number;
  expenseCount: number;
  profit: number;
  repairCount: number;
  repairSum: number;
  paybackPct: number | null;
  paybackNet: number | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const { from, to } = getDefaultRange();
    if (fromParam) from.setTime(startOfDay(new Date(fromParam)).getTime());
    if (toParam) to.setTime(endOfDay(new Date(toParam)).getTime());

    const rangeStart = from;
    const rangeEnd = to;
    const totalDays = periodDays(rangeStart, rangeEnd);

    const [bikes, rents, expenseGroups, unassignedAgg, allTimeRentRevenue, allTimeMiscIncome, allTimeMiscExpense, expenseCategoryGroups, repairGroups] = await Promise.all([
      prisma.bike.findMany({
        select: {
          id: true,
          name: true,
          externalId: true,
          purchasePrice: true,
          purchaseDate: true,
          mileage: true,
        },
        orderBy: { id: 'desc' },
      }),
      prisma.rent.findMany({
        where: {
          status: { not: 'CANCELLED' },
          OR: [
            { startDate: { gte: rangeStart, lte: rangeEnd } },
            { endDate: { gte: rangeStart, lte: rangeEnd } },
            { AND: [{ startDate: { lte: rangeStart } }, { endDate: { gte: rangeEnd } }] },
          ],
        },
        select: {
          id: true,
          bikeId: true,
          startDate: true,
          endDate: true,
          actualReturnDate: true,
          totalPrice: true,
          status: true,
        },
      }),
      prisma.miscTransaction.groupBy({
        by: ['bikeId'],
        where: {
          kind: 'EXPENSE',
          bikeId: { not: null },
          createdAt: { gte: rangeStart, lte: rangeEnd },
        },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.miscTransaction.aggregate({
        where: {
          kind: 'EXPENSE',
          bikeId: null,
          createdAt: { gte: rangeStart, lte: rangeEnd },
        },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.rent.groupBy({
        by: ['bikeId'],
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalPrice: true },
      }),
      prisma.miscTransaction.groupBy({
        by: ['bikeId'],
        where: { kind: 'INCOME', bikeId: { not: null } },
        _sum: { amount: true },
      }),
      prisma.miscTransaction.groupBy({
        by: ['bikeId'],
        where: { kind: 'EXPENSE', bikeId: { not: null } },
        _sum: { amount: true },
      }),
      prisma.miscTransaction.groupBy({
        by: ['category'],
        where: {
          kind: 'EXPENSE',
          createdAt: { gte: rangeStart, lte: rangeEnd },
        },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.miscTransaction.groupBy({
        by: ['bikeId'],
        where: {
          kind: 'EXPENSE',
          category: 'REPAIR',
          bikeId: { not: null },
          createdAt: { gte: rangeStart, lte: rangeEnd },
        },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    const repairByBike: Record<number, { sum: number; count: number }> = {};
    repairGroups.forEach((g) => {
      if (g.bikeId != null) {
        repairByBike[g.bikeId] = { sum: Number(g._sum.amount ?? 0), count: g._count._all };
      }
    });

    const toSumMap = (groups: { bikeId: number | null; _sum: { amount?: unknown; totalPrice?: unknown } }[], field: 'amount' | 'totalPrice') => {
      const map: Record<number, number> = {};
      groups.forEach((g) => {
        if (g.bikeId != null) map[g.bikeId] = Number(g._sum[field] ?? 0);
      });
      return map;
    };
    const allTimeRevenueMap = toSumMap(allTimeRentRevenue, 'totalPrice');
    const allTimeMiscIncomeMap = toSumMap(allTimeMiscIncome, 'amount');
    const allTimeMiscExpenseMap = toSumMap(allTimeMiscExpense, 'amount');

    const revenueByBike: Record<number, number> = {};
    const rentDaysByBike: Record<number, number> = {};
    const rentCountByBike: Record<number, number> = {};

    rents.forEach((rent) => {
      const isFinished = rent.status === 'RETURNED' || rent.status === 'COMPLETED';
      const end = isFinished && rent.actualReturnDate
        ? new Date(rent.actualReturnDate)
        : new Date(rent.endDate);

      // Реальная дата окончания аренды не может быть раньше начала
      const safeEnd = end < new Date(rent.startDate) ? new Date(rent.endDate) : end;
      const days = overlapDays(new Date(rent.startDate), safeEnd, rangeStart, rangeEnd);
      if (days > 0) {
        const fullDays = overlapDays(
          new Date(rent.startDate),
          safeEnd,
          new Date(rent.startDate),
          safeEnd
        );
        const total = Number(rent.totalPrice) || 0;
        const revenue = fullDays > 0 ? Math.round(total * (days / fullDays)) : total;

        revenueByBike[rent.bikeId] = (revenueByBike[rent.bikeId] || 0) + revenue;
        rentDaysByBike[rent.bikeId] = (rentDaysByBike[rent.bikeId] || 0) + days;
        rentCountByBike[rent.bikeId] = (rentCountByBike[rent.bikeId] || 0) + 1;
      }
    });

    const expenseByBike: Record<number, { sum: number; count: number }> = {};
    expenseGroups.forEach((g) => {
      if (g.bikeId != null) {
        expenseByBike[g.bikeId] = {
          sum: Number(g._sum.amount ?? 0),
          count: g._count._all,
        };
      }
    });

    const bikeStats: BikeStat[] = bikes.map((bike) => {
      const rentDays = rentDaysByBike[bike.id] || 0;
      const rentCount = rentCountByBike[bike.id] || 0;
      const revenue = revenueByBike[bike.id] || 0;
      const avgCheck = rentCount > 0 ? Math.round(revenue / rentCount) : 0;
      const utilization = Math.min(100, Math.round((rentDays / totalDays) * 1000) / 10);
      const expenses = expenseByBike[bike.id]?.sum || 0;
      const expenseCount = expenseByBike[bike.id]?.count || 0;

      const purchase = bike.purchasePrice != null ? Number(bike.purchasePrice) : null;
      const allTimeNet =
        (allTimeRevenueMap[bike.id] || 0) +
        (allTimeMiscIncomeMap[bike.id] || 0) -
        (allTimeMiscExpenseMap[bike.id] || 0);
      const paybackPct =
        purchase != null && purchase > 0
          ? Math.round((allTimeNet / purchase) * 1000) / 10
          : null;
      const paybackNet = purchase != null ? allTimeNet - purchase : null;

      return {
        id: bike.id,
        name: bike.name,
        externalId: bike.externalId,
        purchasePrice: bike.purchasePrice != null ? Number(bike.purchasePrice) : null,
        purchaseDate: bike.purchaseDate ? bike.purchaseDate.toISOString() : null,
        mileage: bike.mileage,
        rentDays,
        rentCount,
        revenue,
        avgCheck,
        utilization,
        expenses,
        expenseCount,
        profit: revenue - expenses,
        repairCount: repairByBike[bike.id]?.count || 0,
        repairSum: repairByBike[bike.id]?.sum || 0,
        paybackPct,
        paybackNet,
      };
    });

    const totals = {
      rentDays: bikeStats.reduce((sum, b) => sum + b.rentDays, 0),
      rentCount: bikeStats.reduce((sum, b) => sum + b.rentCount, 0),
      revenue: bikeStats.reduce((sum, b) => sum + b.revenue, 0),
      avgCheck: bikeStats.length
        ? Math.round(bikeStats.reduce((sum, b) => sum + b.revenue, 0) / Math.max(1, bikeStats.reduce((sum, b) => sum + b.rentCount, 0)))
        : 0,
      utilization: bikeStats.length
        ? Math.round((bikeStats.reduce((sum, b) => sum + b.utilization, 0) / bikeStats.length) * 10) / 10
        : 0,
      expenses: bikeStats.reduce((sum, b) => sum + b.expenses, 0),
      expenseCount: bikeStats.reduce((sum, b) => sum + b.expenseCount, 0),
      profit: bikeStats.reduce((sum, b) => sum + b.profit, 0),
      unassignedExpenses: Number(unassignedAgg._sum.amount ?? 0),
      unassignedCount: unassignedAgg._count._all,
    };

    return NextResponse.json({
      from: rangeStart.toISOString().split('T')[0],
      to: rangeEnd.toISOString().split('T')[0],
      totalDays,
      bikes: bikeStats,
      totals,
      expenseByCategory: expenseCategoryGroups
        .map((g) => ({
          category: g.category || 'NONE',
          sum: Number(g._sum.amount ?? 0),
          count: g._count._all,
        }))
        .sort((a, b) => b.sum - a.sum),
    });
  } catch (error) {
    console.error('Ошибка при подсчёте статистики:', error);
    return NextResponse.json({ error: 'Ошибка при подсчёте статистики' }, { status: 500 });
  }
}
