import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const [bikes, activeRents] = await Promise.all([
        tx.bike.findMany({
          select: { id: true, status: true },
        }),
        tx.rent.findMany({
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
            tx.bike.update({
              where: { id: bike.id },
              data: { status: newStatus },
            })
          );
          changes.push({ id: bike.id, oldStatus: bike.status, newStatus });
        }
      });

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      return {
        fixed: changes.length,
        rentedBikeCount: rentedBikeIds.size,
        duplicateRents: duplicateRents.length,
        changes,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка сверки статусов байков:', error);
    return NextResponse.json(
      { error: 'Ошибка сверки статусов байков' },
      { status: 500 }
    );
  }
}
