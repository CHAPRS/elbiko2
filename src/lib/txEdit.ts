// Правки денежного журнала аренды (байк/АКБ): пересчёт при редактировании/удалении.

// Дни продления из системного комментария вида «Продление на N дн.»
export function parseExtendDays(comment: string | null | undefined): number | null {
  const m = comment?.match(/Продление на (\d+)\s*дн/i);
  return m ? Number(m[1]) : null;
}

// Пересчёт агрегатов аренды по её транзакциям (после мутации журнала)
export function rentTotals(
  totalPrice: number,
  txs: { type: string; amount: unknown }[]
): { totalPrice: number; paidTotal: number; penaltiesTotal: number; debt: number } {
  let paid = 0;
  let penalties = 0;
  for (const t of txs) {
    const amt = Number(t.amount);
    if (t.type === 'PAYMENT') paid += amt;
    else if (t.type === 'REFUND') paid -= amt;
    else if (t.type === 'PENALTY') penalties += amt;
  }
  paid = Math.max(0, Math.round(paid * 100) / 100);
  penalties = Math.round(penalties * 100) / 100;
  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    paidTotal: paid,
    penaltiesTotal: penalties,
    debt: Math.max(0, Math.round((totalPrice + penalties - paid) * 100) / 100),
  };
}
