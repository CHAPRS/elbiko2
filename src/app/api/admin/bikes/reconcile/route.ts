import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const [bikes, activeRents] = await Promise.all([
      prisma.bike.findMany({
        select: { id: true, status: true },
      }),
      prisma.rent.findMany({
        where: {
          status: { in: ['ACTIVE', 'OVERDUE'] },
        },
        select: { id: true, bikeId: true },
      }),
    ]);

    const rentedBikeIds = new Set<number>();
    const duplicateRents: number[] = [];

    activeRents.forEach((rent) => {
      if (rentedBikeIds.has(rent.bikeId)) {
        duplicateRents.push(rent.id);
      }
      rentedBikeIds.add(rent.bikeId);
    });

    const updates: Promise<unknown>[] = [];
    const changes: { id: number; oldStatus: string; newStatus: string }[] = [];

    bikes.forEach((bike) => {
      const hasActiveRent = rentedBikeIds.has(bike.id);
      let newStatus = bike.status;

      if (hasActiveRent && bike.status !== 'RENTED') {
        newStatus = 'RENTED';
      } else if (
        !hasActiveRent &&
        bike.status !== 'FREE' &&
        bike.status !== 'MAINTENANCE' &&
        bike.status !== 'BLOCKED'
      ) {
        newStatus = 'FREE';
      }

      if (newStatus !== bike.status) {
        updates.push(
          prisma.bike.update({
            where: { id: bike.id },
            data: { status: newStatus },
          })
        );
        changes.push({ id: bike.id, oldStatus: bike.status, newStatus });
      }
    });

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    return NextResponse.json({
      fixed: changes.length,
      rentedBikeCount: rentedBikeIds.size,
      duplicateRents: duplicateRents.length,
      changes,
    });
  } catch (error) {
    console.error('Ошибка сверки статусов байков:', error);
    return NextResponse.json(
      { error: 'Ошибка сверки статусов байков' },
      { status: 500 }
    );
  }
}
