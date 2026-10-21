// Денежный журнал аренды: оплата/возврат/штраф.
// Формула долга: totalPrice + Σ(PENALTY) − Σ(PAYMENT) + Σ(REFUND).

export interface LedgerTx {
  type: string;
  amount: unknown;
}

export function ledgerTotals(txs: LedgerTx[]): { paid: number; penalties: number } {
  let paid = 0;
  let penalties = 0;
  for (const t of txs) {
    const amt = Number(t.amount);
    if (t.type === 'PAYMENT') paid += amt;
    else if (t.type === 'REFUND') paid -= amt;
    else if (t.type === 'PENALTY') penalties += amt;
  }
  return {
    paid: Math.max(0, Math.round(paid * 100) / 100),
    penalties: Math.round(penalties * 100) / 100,
  };
}

export function ledgerDebt(
  totalPrice: number,
  txs: LedgerTx[]
): { paidTotal: number; penaltiesTotal: number; debt: number } {
  const { paid, penalties } = ledgerTotals(txs);
  return {
    paidTotal: paid,
    penaltiesTotal: penalties,
    debt: Math.max(0, Math.round((totalPrice + penalties - paid) * 100) / 100),
  };
}
