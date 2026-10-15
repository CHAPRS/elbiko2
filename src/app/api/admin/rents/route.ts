import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // paidTotal — внесённая сумма из денежного журнала (PAYMENT − REFUND), debt — остаток
    const result = rents.map((r) => {
      const paid = r.rentTransactions.reduce(
        (sum, t) =>
          sum +
          (t.type === 'PAYMENT' ? Number(t.amount) : t.type === 'REFUND' ? -Number(t.amount) : 0),
        0
      );
      const { rentTransactions, ...rest } = r;
      return {
        ...rest,
        paidTotal: Math.max(0, Math.round(paid * 100) / 100),
        debt: Math.max(0, Math.round((Number(r.totalPrice) - paid) * 100) / 100),
      };
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