import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    let days = daysParam && !isNaN(Number(daysParam)) ? Number(daysParam) : 7;
    days = Math.max(1, Math.min(days, 90));

    const now = new Date();
    const today = startOfDay(now);
    const periodStart = new Date(today);
    periodStart.setDate(periodStart.getDate() - (days - 1));
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const userSelect = {
      select: {
        id: true,
        name: true,
        phone: true,
        telegramChatId: true,
        maxChatId: true,
        preferredMessenger: true,
      },
    };

    const bikeSelect = {
      select: { id: true, name: true, status: true },
    };

    const [
      bikes,
      totalUsers,
      newLeads,
      activeAndOverdueRents,
      returningToday,
      returningTomorrow,
      completedRentsForAvg,
      revenueTodayAgg,
      revenuePeriodPayments,
      failedRefundedAgg,
      rentRevenueByBike,
      miscPeriodTx,
      recentMisc,
      buyoutPaidPeriod,
      activeBuyouts,
    ] = await Promise.all([
      prisma.bike.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.user.count(),
      prisma.lead.findMany({
        where: { status: 'NEW' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          bike: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.rent.findMany({
        where: {
          status: { in: ['ACTIVE', 'OVERDUE'] },
        },
        include: {
          user: userSelect,
          bike: bikeSelect,
          payment: true,
        },
        orderBy: { endDate: 'asc' },
      }),
      prisma.rent.findMany({
        where: {
          status: { in: ['ACTIVE', 'OVERDUE'] },
          endDate: { gte: today, lt: tomorrow },
        },
        include: {
          user: userSelect,
          bike: bikeSelect,
        },
        orderBy: { endDate: 'asc' },
      }),
      prisma.rent.findMany({
        where: {
          status: { in: ['ACTIVE', 'OVERDUE'] },
          endDate: { gte: tomorrow, lt: dayAfterTomorrow },
        },
        include: {
          user: userSelect,
          bike: bikeSelect,
        },
        orderBy: { endDate: 'asc' },
      }),
      prisma.rent.aggregate({
        where: { status: 'COMPLETED' },
        _avg: { totalPrice: true },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          updatedAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          updatedAt: { gte: periodStart },
        },
        select: {
          amount: true,
          updatedAt: true,
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: { in: ['FAILED', 'REFUNDED'] },
          updatedAt: { gte: periodStart },
        },
      }),
      prisma.rent.groupBy({
        by: ['bikeId'],
        where: { status: 'COMPLETED' },
        _sum: { totalPrice: true },
      }),
      prisma.miscTransaction.findMany({
        where: {
          createdAt: { gte: periodStart },
        },
        select: {
          kind: true,
          amount: true,
          createdAt: true,
        },
      }),
      prisma.miscTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          bike: { select: { id: true, name: true, externalId: true } },
        },
      }),
      prisma.buyoutPayment.findMany({
        where: {
          status: 'PAID',
          paidAt: { gte: periodStart },
        },
        select: {
          amount: true,
          paidAt: true,
        },
      }),
      prisma.buyout.findMany({
        where: { status: 'ACTIVE' },
        include: {
          payments: { orderBy: { dueDate: 'asc' } },
          bike: { select: { id: true, name: true, externalId: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const activeRents = activeAndOverdueRents;
    const rentedBikeIds = new Set(activeAndOverdueRents.map((r) => r.bikeId));
    const rentedBikes = rentedBikeIds.size;
    const freeBikes = bikes.filter(
      (b) => !rentedBikeIds.has(b.id) && b.status !== 'MAINTENANCE' && b.status !== 'BLOCKED'
    );
    const maintenanceBikes = bikes.filter((b) => b.status === 'MAINTENANCE');
    const blockedBikes = bikes.filter((b) => b.status === 'BLOCKED');
    const overdueRents = activeRents.filter((r) => new Date(r.endDate) < now);

    const availableForRent = freeBikes.length;
    const rentableFleet = bikes.length - maintenanceBikes.length - blockedBikes.length;
    const occupancyRate =
      bikes.length > 0
        ? Math.round((rentedBikes / bikes.length) * 1000) / 10
        : 0;

    const expectedRevenue = activeRents.reduce(
      (sum, r) => sum + Number(r.totalPrice),
      0
    );
    const overdueRevenue = overdueRents.reduce(
      (sum, r) => sum + Number(r.totalPrice),
      0
    );

    const revenueToday = Number(revenueTodayAgg._sum.amount ?? 0);

    const byDay = new Map<string, { revenue: number; misc: number; expense: number; buyout: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(periodStart);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      byDay.set(key, { revenue: 0, misc: 0, expense: 0, buyout: 0 });
    }
    for (const payment of revenuePeriodPayments) {
      const key = payment.updatedAt.toISOString().split('T')[0];
      const entry = byDay.get(key);
      if (entry) {
        entry.revenue += Number(payment.amount);
      }
    }
    for (const tx of miscPeriodTx) {
      const key = tx.createdAt.toISOString().split('T')[0];
      const entry = byDay.get(key);
      if (entry) {
        if (tx.kind === 'INCOME') entry.misc += Number(tx.amount);
        else if (tx.kind === 'EXPENSE') entry.expense += Number(tx.amount);
      }
    }
    for (const bp of buyoutPaidPeriod) {
      if (!bp.paidAt) continue;
      const key = bp.paidAt.toISOString().split('T')[0];
      const entry = byDay.get(key);
      if (entry) {
        entry.buyout += Number(bp.amount);
      }
    }
    const revenueByDay = Array.from(byDay.entries())
      .map(([date, v]) => ({ date, revenue: v.revenue, misc: v.misc, expense: v.expense, buyout: v.buyout }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const revenuePeriod = revenueByDay.reduce((sum, d) => sum + d.revenue, 0);
    const averageCheck = Number(completedRentsForAvg._avg.totalPrice ?? 0);
    const failedRefundedRevenue = Number(failedRefundedAgg._sum.amount ?? 0);

    let miscIncomePeriod = 0;
    let miscIncomeToday = 0;
    let expensesPeriod = 0;
    let expensesToday = 0;
    for (const tx of miscPeriodTx) {
      const amount = Number(tx.amount);
      const isToday = tx.createdAt >= today && tx.createdAt < tomorrow;
      if (tx.kind === 'INCOME') {
        miscIncomePeriod += amount;
        if (isToday) miscIncomeToday += amount;
      } else if (tx.kind === 'EXPENSE') {
        expensesPeriod += amount;
        if (isToday) expensesToday += amount;
      }
    }
    let buyoutIncomePeriod = 0;
    let buyoutIncomeToday = 0;
    for (const bp of buyoutPaidPeriod) {
      const amount = Number(bp.amount);
      buyoutIncomePeriod += amount;
      if (bp.paidAt && bp.paidAt >= today && bp.paidAt < tomorrow) {
        buyoutIncomeToday += amount;
      }
    }

    const netProfitPeriod = revenuePeriod + miscIncomePeriod + buyoutIncomePeriod - expensesPeriod;

    const bikeNameMap = new Map(bikes.map((b) => [b.id, b.name]));
    const topBikes = rentRevenueByBike
      .map((r) => ({
        name: bikeNameMap.get(r.bikeId) || `Байк #${r.bikeId}`,
        revenue: Number(r._sum.totalPrice ?? 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const timelineDays = 14;
    const timeline: {
      date: string;
      dayOfWeek: string;
      freeCount: number;
      returning: typeof activeRents;
    }[] = [];

    for (let i = 0; i < timelineDays; i++) {
      const day = new Date(today);
      day.setDate(day.getDate() + i);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const returning = activeRents.filter((r) => {
        const end = startOfDay(new Date(r.endDate));
        return end.getTime() === day.getTime();
      });

      const occupiedBikeIds = new Set<number>();
      activeRents.forEach((r) => {
        const start = startOfDay(new Date(r.startDate)).getTime();
        const end = endOfDay(new Date(r.endDate)).getTime();
        if (start <= day.getTime() && end > day.getTime()) {
          occupiedBikeIds.add(r.bikeId);
        }
      });
      const occupied = occupiedBikeIds.size;

      const freeCount = Math.max(0, rentableFleet - occupied);

      timeline.push({
        date: day.toISOString().split('T')[0],
        dayOfWeek: day.toLocaleDateString('ru-RU', { weekday: 'short' }),
        freeCount,
        returning,
      });
    }

    const stats = {
      totalBikes: bikes.length,
      rentedBikes,
      freeBikes: freeBikes.length,
      maintenanceBikes: maintenanceBikes.length,
      availableForRent,
      occupancyRate,
      totalUsers,
      newLeads: newLeads.length,
      activeRents: activeRents.length,
      overdueRents: overdueRents.length,
      returningToday: returningToday.length,
      returningTomorrow: returningTomorrow.length,
      revenueToday,
      revenuePeriod,
      expectedRevenue,
      overdueRevenue,
      averageCheck,
      failedRefundedRevenue,
      miscIncomeToday,
      miscIncomePeriod,
      expensesToday,
      expensesPeriod,
      buyoutIncomeToday,
      buyoutIncomePeriod,
      netProfitPeriod,
    };

    return NextResponse.json({
      stats,
      newLeads,
      activeRents,
      overdueRents,
      returningToday,
      returningTomorrow,
      freeBikes,
      maintenanceBikes,
      revenueByDay,
      topBikes,
      timeline,
      bikes,
      recentMisc,
      buyouts: activeBuyouts,
    });
  } catch (error) {
    console.error('Ошибка API диспетчерской:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
