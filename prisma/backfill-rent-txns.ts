import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Одноразовый скрипт восстановления денежного журнала:
// для каждого платежа со статусом COMPLETED проверяет, что сумма
// PAYMENT-транзакций (минус REFUND) покрывает сумму платежа, и досоздаёт
// недостающую PAYMENT-транзакцию с датой фактической оплаты.
// Запуск: npx tsx prisma/backfill-rent-txns.ts
async function main() {
  const payments = await prisma.payment.findMany({
    where: { status: 'COMPLETED' },
    include: {
      rent: {
        select: {
          id: true,
          rentTransactions: { select: { type: true, amount: true } },
        },
      },
    },
  });

  let created = 0;
  let skipped = 0;

  for (const p of payments) {
    if (!p.rent) {
      skipped++;
      continue;
    }
    const paid = p.rent.rentTransactions.reduce(
      (sum, t) =>
        sum +
        (t.type === 'PAYMENT' ? Number(t.amount) : t.type === 'REFUND' ? -Number(t.amount) : 0),
      0
    );
    const missing = Math.round((Number(p.amount) - paid) * 100) / 100;
    if (missing <= 0.009) {
      skipped++;
      continue;
    }

    await prisma.rentTransaction.create({
      data: {
        rentId: p.rent.id,
        type: 'PAYMENT',
        amount: missing,
        method: p.paymentMethod,
        comment: 'Восстановление истории оплат (backfill)',
        createdAt: p.paidAt ?? p.updatedAt,
      },
    });
    created++;
    console.log(`Аренда #${p.rent.id}: +${missing} ₽ (дата: ${(p.paidAt ?? p.updatedAt).toISOString()})`);
  }

  console.log(`Готово: создано ${created} транзакций, пропущено ${skipped} из ${payments.length} оплаченных платежей`);
}

main()
  .catch((err) => {
    console.error('Ошибка backfill:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
