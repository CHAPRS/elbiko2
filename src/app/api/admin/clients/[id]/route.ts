import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeClientRating, hasVisibleDebt } from '@/lib/clients';

export const dynamic = 'force-dynamic';

type TxLike = { type: string; amount: unknown; createdAt: Date; method: string | null; comment: string | null };

function txSum(txs: TxLike[]): number {
  return txs.reduce(
    (sum, t) =>
      sum + (t.type === 'PAYMENT' ? Number(t.amount) : t.type === 'REFUND' ? -Number(t.amount) : 0),
    0
  );
}

// GET /api/admin/clients/[id] — карточка клиента: контакты, рейтинг, история
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        rents: {
          include: {
            bike: { select: { id: true, name: true, externalId: true } },
            rentTransactions: { orderBy: { createdAt: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
        batteryRents: {
          include: {
            battery: { select: { id: true, name: true, serialNumber: true } },
            transactions: { orderBy: { createdAt: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Клиент не найден' }, { status: 404 });
    }

    const leads = await prisma.lead.findMany({
      where: { phone: user.phone },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        itemType: true,
        bikeName: true,
        status: true,
        totalPrice: true,
        createdAt: true,
        rejectReason: true,
      },
    });

    const ratingRents = [
      ...user.rents.map((r) => ({
        status: r.status,
        endDate: r.endDate,
        actualReturnDate: r.actualReturnDate,
        totalPrice: Number(r.totalPrice),
        paidTotal: txSum(r.rentTransactions),
        debtDueDate: r.debtDueDate,
        penaltyCount: r.rentTransactions.filter((t) => t.type === 'PENALTY').length,
      })),
      ...user.batteryRents.map((r) => ({
        status: r.status,
        endDate: r.endDate,
        actualReturnDate: r.actualReturnDate,
        totalPrice: Number(r.totalPrice),
        paidTotal: txSum(r.transactions),
        debtDueDate: r.debtDueDate,
        penaltyCount: r.transactions.filter((t) => t.type === 'PENALTY').length,
      })),
    ];
    const rating = computeClientRating({ isBlacklisted: user.isBlacklisted, rents: ratingRents });

    const rents = user.rents.map((r) => {
      const paid = txSum(r.rentTransactions);
      return {
        id: r.id,
        itemType: 'BIKE' as const,
        itemName: r.bike?.name ?? '',
        itemExternalId: r.bike?.externalId ?? null,
        status: r.status,
        startDate: r.startDate,
        endDate: r.endDate,
        actualReturnDate: r.actualReturnDate,
        totalPrice: Number(r.totalPrice),
        paidTotal: Math.round(paid * 100) / 100,
        debt: Math.max(0, Math.round((Number(r.totalPrice) - paid) * 100) / 100),
        comment: r.comment,
        createdAt: r.createdAt,
      };
    });
    const batteryRents = user.batteryRents.map((r) => {
      const paid = txSum(r.transactions);
      return {
        id: r.id,
        itemType: 'BATTERY' as const,
        itemName: r.battery?.name ?? '',
        itemExternalId: r.battery?.serialNumber ?? null,
        status: r.status,
        startDate: r.startDate,
        endDate: r.endDate,
        actualReturnDate: r.actualReturnDate,
        totalPrice: Number(r.totalPrice),
        paidTotal: Math.round(paid * 100) / 100,
        debt: Math.max(0, Math.round((Number(r.totalPrice) - paid) * 100) / 100),
        comment: r.comment,
        createdAt: r.createdAt,
      };
    });

    // Единая лента платежей по всем арендам клиента
    const timeline = [
      ...user.rents.flatMap((r) =>
        r.rentTransactions.map((t) => ({
          id: `r-${t.id}`,
          date: t.createdAt,
          label: `Аренда #${r.id} · ${r.bike?.name ?? ''}`,
          type: t.type,
          amount: Number(t.amount),
          method: t.method,
          comment: t.comment,
        }))
      ),
      ...user.batteryRents.flatMap((r) =>
        r.transactions.map((t) => ({
          id: `b-${t.id}`,
          date: t.createdAt,
          label: `АКБ #${r.id} · ${r.battery?.name ?? ''}`,
          type: t.type,
          amount: Number(t.amount),
          method: t.method,
          comment: t.comment,
        }))
      ),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalRevenue = Math.round(
      (rents.reduce((s, r) => s + r.paidTotal, 0) + batteryRents.reduce((s, r) => s + r.paidTotal, 0)) * 100
    ) / 100;
    const openDebt = Math.round(
      [...rents, ...batteryRents].reduce((s, r) => s + hasVisibleDebt(r), 0) * 100
    ) / 100;

    return NextResponse.json({
      client: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        telegramChatId: user.telegramChatId,
        maxChatId: user.maxChatId,
        preferredMessenger: user.preferredMessenger,
        balance: Number(user.balance),
        isBlacklisted: user.isBlacklisted,
        blacklistReason: user.blacklistReason,
        adminNote: user.adminNote,
        createdAt: user.createdAt,
      },
      stats: {
        rentsCount: user.rents.length,
        batteryRentsCount: user.batteryRents.length,
        totalRevenue,
        openDebt,
        leadsCount: leads.length,
      },
      rating,
      rents: [...rents, ...batteryRents].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      timeline,
      leads,
    });
  } catch (error) {
    console.error('Ошибка загрузки карточки клиента:', error);
    return NextResponse.json({ error: 'Не удалось загрузить клиента' }, { status: 500 });
  }
}

// PATCH /api/admin/clients/[id] — заметка менеджера и чёрный список
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if ('adminNote' in body) {
      data.adminNote = body.adminNote === null || body.adminNote === '' ? null : String(body.adminNote);
    }
    if ('isBlacklisted' in body) {
      data.isBlacklisted = Boolean(body.isBlacklisted);
    }
    if ('blacklistReason' in body) {
      data.blacklistReason =
        body.blacklistReason === null || body.blacklistReason === '' ? null : String(body.blacklistReason);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json({
      id: user.id,
      adminNote: user.adminNote,
      isBlacklisted: user.isBlacklisted,
      blacklistReason: user.blacklistReason,
    });
  } catch (error) {
    console.error('Ошибка обновления клиента:', error);
    return NextResponse.json({ error: 'Не удалось обновить клиента' }, { status: 500 });
  }
}
