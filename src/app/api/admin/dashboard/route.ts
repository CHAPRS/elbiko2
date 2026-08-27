import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
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

    const [
      bikes,
      totalUsers,
      newLeads,
      activeRents,
      completedRentsForAvg,
      revenueTodayAgg,
      revenuePeriodPayments,
      failedRefundedAgg,
      rentRevenueByBike,
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
        where: { status: 'ACTIVE' },
        include: {
          user: {
            select: { id: true, name: true, phone: true },
          },
          bike: {
            select: { id: true, name: true, status: true },
          },
          payment: true,
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
    ]);

    const rentedBikes = bikes.filter((b) => b.status === 'RENTED').length;
    const freeBikes = bikes.filter((b) => b.status === 'FREE');
    const maintenanceBikes = bikes.filter((b) => b.status === 'MAINTENANCE');
    const overdueRents = activeRents.filter((r) => new Date(r.endDate) < now);

    const expectedRevenue = activeRents.reduce(
      (sum, r) => sum + Number(r.totalPrice),
      0
    );
    const overdueRevenue = overdueRents.reduce(
      (sum, r) => sum + Number(r.totalPrice),
      0
    );

    const revenueToday = Number(revenueTodayAgg._sum.amount ?? 0);

    const byDay = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(periodStart);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      byDay.set(key, 0);
    }
    for (const payment of revenuePeriodPayments) {
      const key = payment.updatedAt.toISOString().split('T')[0];
      if (byDay.has(key)) {
        byDay.set(key, byDay.get(key)! + Number(payment.amount));
      }
    }
    const revenueByDay = Array.from(byDay.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const revenuePeriod = revenueByDay.reduce((sum, d) => sum + d.revenue, 0);
    const averageCheck = Number(completedRentsForAvg._avg.totalPrice ?? 0);
    const failedRefundedRevenue = Number(failedRefundedAgg._sum.amount ?? 0);

    const bikeNameMap = new Map(bikes.map((b) => [b.id, b.name]));
    const topBikes = rentRevenueByBike
      .map((r) => ({
        name: bikeNameMap.get(r.bikeId) || `Байк #${r.bikeId}`,
        revenue: Number(r._sum.totalPrice ?? 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const stats = {
      totalBikes: bikes.length,
      rentedBikes,
      freeBikes: freeBikes.length,
      maintenanceBikes: maintenanceBikes.length,
      totalUsers,
      newLeads: newLeads.length,
      activeRents: activeRents.length,
      overdueRents: overdueRents.length,
      revenueToday,
      revenuePeriod,
      expectedRevenue,
      overdueRevenue,
      averageCheck,
      failedRefundedRevenue,
    };

    return NextResponse.json({
      stats,
      newLeads,
      activeRents,
      overdueRents,
      freeBikes,
      maintenanceBikes,
      revenueByDay,
      topBikes,
    });
  } catch (error) {
    console.error('Ошибка API диспетчерской:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
