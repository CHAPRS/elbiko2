'use client';

// Журнал операций аренды: просмотр + правка/удаление транзакций.
// Используется в модалках редактирования аренды (байк и АКБ).

import { useEffect, useState } from 'react';

interface Tx {
  id: number;
  type: string;
  amount: number;
  method: string | null;
  comment: string | null;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  PAYMENT: 'Оплата',
  EXTEND: 'Продление',
  REFUND: 'Возврат',
  PENALTY: 'Штраф',
  DEPOSIT: 'Залог',
};

const TYPE_STYLES: Record<string, string> = {
  PAYMENT: 'text-emerald-400',
  EXTEND: 'text-cyan-400',
  REFUND: 'text-amber-400',
  PENALTY: 'text-orange-400',
  DEPOSIT: 'text-violet-400',
};

const METHODS: Record<string, string> = {
  CASH: 'Наличные',
  SBP: 'СБП',
  CARD: 'Карта',
  TRANSFER: 'Перевод',
};

export function TxJournal({
  listUrl,
  itemUrl,
  onChanged,
  onTotals,
}: {
  listUrl: string;
  itemUrl: (id: number) => string;
  onChanged?: () => void;
  onTotals?: (t: { totalPrice: number; paidTotal: number; debt: number }) => void;
}) {
  const [items, setItems] = useState<Tx[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editMethod, setEditMethod] = useState('');
  const [editComment, setEditComment] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(listUrl);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки журнала');
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки журнала');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUrl]);

  const startEdit = (t: Tx) => {
    setEditId(t.id);
    setEditAmount(String(Number(t.amount)));
    setEditMethod(t.method ?? '');
    setEditComment(t.comment ?? '');
    setError(null);
  };

  const saveEdit = async () => {
    if (editId === null) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(itemUrl(editId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: editAmount,
          method: editMethod || null,
          comment: editComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Не удалось сохранить');
      setEditId(null);
      await load();
      onTotals?.(data);
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (t: Tx) => {
    const warn =
      t.type === 'EXTEND'
        ? `Удалить продление на ${Number(t.amount).toLocaleString('ru-RU')} ₽? Сумма будет вычтена из стоимости аренды, дни — откачены (если известны).`
        : `Удалить «${TYPE_LABELS[t.type] ?? t.type}» на ${Number(t.amount).toLocaleString('ru-RU')} ₽?`;
    if (!confirm(warn)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(itemUrl(t.id), { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Не удалось удалить');
      await load();
      onTotals?.(data);
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить');
    } finally {
      setBusy(false);
    }
  };

  if (items === null && !error) {
    return <p className="text-xs text-slate-500">Загрузка журнала…</p>;
  }

  return (
    <div>
      {error && <p className="mb-2 text-xs text-rose-400">{error}</p>}
      {items && items.length === 0 ? (
        <p className="text-xs text-slate-500">Операций пока нет.</p>
      ) : (
        <ul className="space-y-1.5">
          {items!.map((t) => (
            <li
              key={t.id}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs"
            >
              {editId === t.id ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${TYPE_STYLES[t.type] ?? 'text-slate-300'}`}>
                      {TYPE_LABELS[t.type] ?? t.type}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-24 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                    />
                    <span className="text-slate-500">₽</span>
                    <select
                      value={editMethod}
                      onChange={(e) => setEditMethod(e.target.value)}
                      className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                    >
                      <option value="">— способ —</option>
                      {Object.entries(METHODS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    placeholder="Комментарий"
                    className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={busy}
                      className="rounded bg-cyan-600 px-3 py-1 text-white hover:bg-cyan-500 disabled:opacity-50"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      disabled={busy}
                      className="rounded bg-slate-800 px-3 py-1 text-slate-300 hover:bg-slate-700"
                    >
                      Отмена
                    </button>
                  </div>
                  {t.type === 'EXTEND' && (
                    <p className="text-slate-500">
                      Разница суммы изменит общую стоимость аренды автоматически.
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${TYPE_STYLES[t.type] ?? 'text-slate-300'}`}>
                    {TYPE_LABELS[t.type] ?? t.type}
                  </span>
                  <span className="text-slate-200">
                    {Number(t.amount).toLocaleString('ru-RU')} ₽
                  </span>
                  {t.method && (
                    <span className="text-slate-500">{METHODS[t.method] ?? t.method}</span>
                  )}
                  <span className="flex-1 truncate text-slate-500" title={t.comment ?? ''}>
                    {t.comment ?? ''}
                  </span>
                  <span className="text-slate-600">
                    {new Date(t.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                  <button
                    onClick={() => startEdit(t)}
                    disabled={busy}
                    className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                  >
                    Ред.
                  </button>
                  <button
                    onClick={() => remove(t)}
                    disabled={busy}
                    className="rounded bg-rose-900/60 px-2 py-0.5 text-rose-300 hover:bg-rose-800 disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
