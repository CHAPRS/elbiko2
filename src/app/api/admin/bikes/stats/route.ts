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
  const e = endOfDay(end).getTime();
  const f = from.getTime();
  const t = to.getTime();
  const overlapStart = Math.max(s, f);
  const overlapEnd = Math.min(e, t);
  if (overlapEnd < overlapStart) return 0;
  return Math.floor((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
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
  rentDays: number;
  rentCount: number;
  revenue: number;
  avgCheck: number;
  utilization: number;
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

    const [bikes, rents, payments] = await Promise.all([
      prisma.bike.findMany({
        select: { id: true, name: true, externalId: true },
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
          status: true,
        },
      }),
      prisma.rentTransaction.findMany({
        where: {
          type: 'PAYMENT',
          createdAt: { gte: rangeStart, lte: rangeEnd },
        },
        include: {
          rent: {
            select: { bikeId: true },
          },
        },
      }),
    ]);

    const revenueByBike: Record<number, number> = {};
    payments.forEach((tx) => {
      const bikeId = tx.rent?.bikeId;
      if (!bikeId) return;
      revenueByBike[bikeId] = (revenueByBike[bikeId] || 0) + Number(tx.amount);
    });

    const rentDaysByBike: Record<number, number> = {};
    const rentCountByBike: Record<number, number> = {};

    rents.forEach((rent) => {
      const end = rent.actualReturnDate
        ? new Date(rent.actualReturnDate)
        : rent.status === 'RETURNED'
        ? new Date(rent.endDate)
        : new Date(rent.endDate);

      // Реальная дата окончания аренды не может быть раньше начала
      const safeEnd = end < new Date(rent.startDate) ? new Date(rent.endDate) : end;
      const days = overlapDays(new Date(rent.startDate), safeEnd, rangeStart, rangeEnd);
      if (days > 0) {
        rentDaysByBike[rent.bikeId] = (rentDaysByBike[rent.bikeId] || 0) + days;
        rentCountByBike[rent.bikeId] = (rentCountByBike[rent.bikeId] || 0) + 1;
      }
    });

    const bikeStats: BikeStat[] = bikes.map((bike) => {
      const rentDays = rentDaysByBike[bike.id] || 0;
      const rentCount = rentCountByBike[bike.id] || 0;
      const revenue = revenueByBike[bike.id] || 0;
      const avgCheck = rentCount > 0 ? Math.round(revenue / rentCount) : 0;
      const utilization = Math.min(100, Math.round((rentDays / totalDays) * 1000) / 10);

      return {
        id: bike.id,
        name: bike.name,
        externalId: bike.externalId,
        rentDays,
        rentCount,
        revenue,
        avgCheck,
        utilization,
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
    };

    return NextResponse.json({
      from: rangeStart.toISOString().split('T')[0],
      to: rangeEnd.toISOString().split('T')[0],
      totalDays,
      bikes: bikeStats,
      totals,
    });
  } catch (error) {
    console.error('Ошибка при подсчёте статистики:', error);
    return NextResponse.json({ error: 'Ошибка при подсчёте статистики' }, { status: 500 });
  }
}
