import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [bikes, totalUsers, newLeads, activeRents] = await Promise.all([
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
    ]);

    const now = new Date();
    const rentedBikes = bikes.filter((b) => b.status === 'RENTED').length;
    const freeBikes = bikes.filter((b) => b.status === 'FREE');
    const maintenanceBikes = bikes.filter((b) => b.status === 'MAINTENANCE');
    const overdueRents = activeRents.filter((r) => new Date(r.endDate) < now);

    const stats = {
      totalBikes: bikes.length,
      rentedBikes,
      freeBikes: freeBikes.length,
      maintenanceBikes: maintenanceBikes.length,
      totalUsers,
      newLeads: newLeads.length,
      activeRents: activeRents.length,
      overdueRents: overdueRents.length,
    };

    return NextResponse.json({
      stats,
      newLeads,
      activeRents,
      overdueRents,
      freeBikes,
      maintenanceBikes,
    });
  } catch (error) {
    console.error('Ошибка API диспетчерской:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
