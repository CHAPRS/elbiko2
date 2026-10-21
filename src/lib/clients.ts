// Рейтинг надёжности клиента — вычисляется по истории аренд и платежей.
// Чистые функции, общие для /api/admin/clients и /api/admin/clients/[id].

export type ClientRatingCode = 'BLACKLIST' | 'RISK' | 'WATCH' | 'RELIABLE' | 'NEW';

export interface ClientRating {
  code: ClientRatingCode;
  label: string;
  reasons: string[];
}

export const CLIENT_RATING_LABELS: Record<ClientRatingCode, string> = {
  BLACKLIST: 'Чёрный список',
  RISK: 'Риск',
  WATCH: 'Наблюдение',
  RELIABLE: 'Надёжный',
  NEW: 'Новый',
};

// Час, после которого невозврат в день сдачи считается просрочкой
export const RETURN_CUTOFF_HOUR = 16;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Просрочен ли возврат: срок вчера и раньше — да; срок сегодня — только после 16:00
export function isReturnOverdue(endDate: Date | string, now: Date = new Date()): boolean {
  const end = startOfDay(new Date(endDate));
  const today = startOfDay(now);
  if (end < today) return true;
  if (end.getTime() === today.getTime()) return now.getHours() >= RETURN_CUTOFF_HOUR;
  return false;
}

// «Видимый» долг: остаток > 0 и (возврат просрочен ИЛИ была частичная оплата ИЛИ назначен срок погашения)
export function hasVisibleDebt(input: {
  totalPrice: number;
  paidTotal: number;
  debtDueDate?: Date | string | null;
  endDate: Date | string;
  status: string;
  now?: Date;
}): number {
  const finished = ['RETURNED', 'COMPLETED', 'CANCELLED'].includes(input.status);
  const debt = Math.max(0, input.totalPrice - input.paidTotal);
  if (debt <= 0) return 0;
  // Завершённая аренда с остатком — реальный долг; активная — только если просрочен возврат,
  // была частичная оплата или назначен срок погашения
  if (finished) return debt;
  const overdue = isReturnOverdue(input.endDate, input.now ?? new Date());
  if (overdue || input.paidTotal > 0 || input.debtDueDate) return debt;
  return 0;
}

interface RatingRentLike {
  status: string;
  endDate: Date;
  actualReturnDate: Date | null;
  totalPrice: number;
  paidTotal: number;
  debtDueDate: Date | null;
  penaltyCount: number;
}

export function computeClientRating(input: {
  isBlacklisted: boolean;
  rents: RatingRentLike[];
  now?: Date;
}): ClientRating {
  if (input.isBlacklisted) {
    return { code: 'BLACKLIST', label: CLIENT_RATING_LABELS.BLACKLIST, reasons: [] };
  }

  const now = input.now ?? new Date();

  let completed = 0;
  let lateReturns = 0;
  let overdueNow = 0;
  let openDebt = 0;
  let overdueDebt = false;
  let penalties = 0;

  for (const r of input.rents) {
    const end = startOfDay(new Date(r.endDate));
    const isFinished = ['RETURNED', 'COMPLETED', 'CANCELLED'].includes(r.status);
    if (isFinished && r.status !== 'CANCELLED') completed += 1;

    if (r.actualReturnDate) {
      const ret = startOfDay(new Date(r.actualReturnDate));
      if (ret > end) lateReturns += 1;
    }

    if (!isFinished && isReturnOverdue(r.endDate, now)) overdueNow += 1;

    const debt = hasVisibleDebt({
      totalPrice: r.totalPrice,
      paidTotal: r.paidTotal,
      debtDueDate: r.debtDueDate,
      endDate: r.endDate,
      status: r.status,
      now,
    });
    if (debt > 0) {
      openDebt += 1;
      if (r.debtDueDate && startOfDay(new Date(r.debtDueDate)) < startOfDay(now)) overdueDebt = true;
    }

    penalties += r.penaltyCount;
  }

  const reasons: string[] = [];
  if (openDebt > 0) reasons.push(`открытый долг по ${openDebt} аренде(ам)`);
  if (overdueDebt) reasons.push('долг просрочен по сроку погашения');
  if (overdueNow > 0) reasons.push(`просроченных аренд сейчас: ${overdueNow}`);
  if (lateReturns > 0) reasons.push(`поздних возвратов: ${lateReturns}`);
  if (penalties > 0) reasons.push(`штрафов: ${penalties}`);

  let code: ClientRatingCode;
  if (openDebt > 0 || overdueNow > 0 || penalties > 0 || lateReturns >= 2) {
    code = 'RISK';
  } else if (lateReturns === 1) {
    code = 'WATCH';
  } else if (completed > 0) {
    code = 'RELIABLE';
  } else {
    code = 'NEW';
  }

  return { code, label: CLIENT_RATING_LABELS[code], reasons };
}
