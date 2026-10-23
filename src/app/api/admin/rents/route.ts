import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ledgerDebt } from '@/lib/rentLedger';
import { reconcileFleetStatuses } from '@/lib/fleet';

export const dynamic = 'force-dynamic';

// GET - Получение всех аренд с фильтрацией
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const bikeId = searchParams.get('bikeId');

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = Number(userId);
    if (bikeId) where.bikeId = Number(bikeId);

    await reconcileFleetStatuses();

    const rents = await prisma.rent.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        bike: {
          select: {
            id: true,
            name: true,
            externalId: true,
            status: true,
          },
        },
        payment: true,
        rentTransactions: { select: { type: true, amount: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // paidTotal — внесённая сумма (PAYMENT − REFUND), debt = цена + штрафы − внесено
    const result = rents.map((r) => {
      const { rentTransactions, ...rest } = r;
      return { ...rest, ...ledgerDebt(Number(r.totalPrice), rentTransactions) };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка при получении аренд:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении аренд' },
      { status: 500 }
    );
  }
}