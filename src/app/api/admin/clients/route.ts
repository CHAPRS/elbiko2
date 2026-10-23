import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeClientRating, hasVisibleDebt } from '@/lib/clients';

export const dynamic = 'force-dynamic';

type TxLike = { type: string; amount: unknown };

function txSum(txs: TxLike[]): number {
  return txs.reduce(
    (sum, t) =>
      sum + (t.type === 'PAYMENT' ? Number(t.amount) : t.type === 'REFUND' ? -Number(t.amount) : 0),
    0
  );
}

function penSum(txs: TxLike[]): number {
  return txs.reduce(
    (sum, t) => sum + (t.type === 'PENALTY' ? Number(t.amount) : 0),
    0
  );
}

// GET /api/admin/clients — список клиентов с агрегатами и рейтингом
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        rents: {
          select: {
            status: true,
            endDate: true,
            actualReturnDate: true,
            totalPrice: true,
            debtDueDate: true,
            createdAt: true,
            rentTransactions: { select: { type: true, amount: true } },
          },
        },
        batteryRents: {
          select: {
            status: true,
            endDate: true,
            actualReturnDate: true,
            totalPrice: true,
            debtDueDate: true,
            createdAt: true,
            transactions: { select: { type: true, amount: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const clients = users.map((u) => {
      const allRents = [...u.rents, ...u.batteryRents];

      const ratingInput = allRents.map((r) => {
        const txs = 'rentTransactions' in r ? r.rentTransactions : r.transactions;
        const paid = txSum(txs);
        const penaltiesTotal = penSum(txs);
        const penaltyCount = txs.filter((t) => t.type === 'PENALTY').length;
        return {
          status: r.status,
          endDate: r.endDate,
          actualReturnDate: r.actualReturnDate,
          totalPrice: Number(r.totalPrice),
          paidTotal: paid,
          penaltiesTotal,
          debtDueDate: r.debtDueDate,
          penaltyCount,
        };
      });
      const rating = computeClientRating({ isBlacklisted: u.isBlacklisted, rents: ratingInput });

      const revenue =
        u.rents.reduce((s, r) => s + txSum(r.rentTransactions), 0) +
        u.batteryRents.reduce((s, r) => s + txSum(r.transactions), 0);

      const openDebt = ratingInput.reduce((s, r) => s + hasVisibleDebt(r), 0);

      const lastRentAt =
        allRents.length > 0
          ? allRents.reduce((max, r) => (r.createdAt > max ? r.createdAt : max), allRents[0].createdAt)
          : null;

      return {
        id: u.id,
        name: u.name,
        phone: u.phone,
        email: u.email,
        preferredMessenger: u.preferredMessenger,
        isBlacklisted: u.isBlacklisted,
        createdAt: u.createdAt,
        rentsCount: u.rents.length,
        batteryRentsCount: u.batteryRents.length,
        revenue: Math.round(revenue * 100) / 100,
        openDebt: Math.round(openDebt * 100) / 100,
        lastRentAt,
        rating,
      };
    });

    // Активные клиенты выше: по убыванию revenue, затем по дате последней аренды
    clients.sort((a, b) => {
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      const ta = a.lastRentAt ? new Date(a.lastRentAt).getTime() : 0;
      const tb = b.lastRentAt ? new Date(b.lastRentAt).getTime() : 0;
      return tb - ta;
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Ошибка загрузки клиентов:', error);
    return NextResponse.json({ error: 'Не удалось загрузить клиентов' }, { status: 500 });
  }
}
