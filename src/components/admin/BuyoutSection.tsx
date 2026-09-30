'use client';

import React, { useState } from 'react';

interface BikeOption {
  id: number;
  name: string;
  externalId?: string | null;
}

export interface BuyoutPayment {
  id: number;
  dueDate: string;
  amount: number | string;
  status: string;
  paidAt?: string | null;
  method?: string | null;
  comment?: string | null;
}

export interface Buyout {
  id: number;
  title: string;
  clientName: string;
  clientPhone?: string | null;
  bikeId?: number | null;
  bike?: { id: number; name: string; externalId?: string | null } | null;
  totalPrice: number | string;
  status: string;
  startDate: string;
  comment?: string | null;
  payments: BuyoutPayment[];
}

interface BuyoutSectionProps {
  buyouts: Buyout[];
  bikes: BikeOption[];
  onChanged: () => void;
  onError: (msg: string) => void;
  onNotice: (msg: string) => void;
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Наличные',
  SBP: 'СБП',
  CARD: 'Карта',
  TRANSFER: 'Перевод',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Активен',
  COMPLETED: 'Выкуплен',
  CANCELLED: 'Отменён',
};

function fmtMoney(v: number): string {
  return `${Math.round(v).toLocaleString('ru-RU')} ₽`;
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function toInputDate(d: Date | string): string {
  const date = new Date(d);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
}

export function BuyoutSection({ buyouts, bikes, onChanged, onError, onNotice }: BuyoutSectionProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [rowBusy, setRowBusy] = useState<number | null>(null);

  // Форма создания
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [bikeId, setBikeId] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [comment, setComment] = useState('');
  const [schedMode, setSchedMode] = useState<'auto' | 'manual' | 'none'>('auto');
  const [firstDate, setFirstDate] = useState(toInputDate(new Date()));
  const [count, setCount] = useState('4');
  const [interval, setInterval] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [manualRows, setManualRows] = useState<{ dueDate: string; amount: string }[]>([]);

  // Добавление строки в существующий график
  const [newPayDate, setNewPayDate] = useState('');
  const [newPayAmount, setNewPayAmount] = useState('');
  const [payMethods, setPayMethods] = useState<Record<number, string>>({});

  const resetForm = () => {
    setTitle('');
    setClientName('');
    setClientPhone('');
    setBikeId('');
    setTotalPrice('');
    setComment('');
    setSchedMode('auto');
    setFirstDate(toInputDate(new Date()));
    setCount('4');
    setInterval('WEEKLY');
    setManualRows([]);
  };

  // Локальный предпросмотр авто-графика (та же логика, что на сервере)
  const previewSchedule = () => {
    const total = Number(totalPrice);
    const n = Number(count);
    if (!Number.isFinite(total) || total <= 0 || !Number.isInteger(n) || n <= 0 || !firstDate) {
      return [] as { dueDate: string; amount: number }[];
    }
    const base = Math.floor((total / n) * 100) / 100;
    const items: { dueDate: string; amount: number }[] = [];
    let allocated = 0;
    for (let i = 0; i < n; i++) {
      const d = new Date(firstDate);
      if (interval === 'WEEKLY') d.setDate(d.getDate() + i * 7);
      else d.setMonth(d.getMonth() + i);
      const amount = i === n - 1 ? Math.round((total - allocated) * 100) / 100 : base;
      allocated += amount;
      items.push({ dueDate: toInputDate(d), amount });
    }
    return items;
  };

  const createBuyout = async () => {
    const total = Number(totalPrice);
    if (!title.trim() || !clientName.trim()) {
      onError('Укажите предмет и имя клиента');
      return;
    }
    if (!Number.isFinite(total) || total <= 0) {
      onError('Укажите корректную стоимость выкупа');
      return;
    }

    const payload: any = {
      title: title.trim(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || null,
      bikeId: bikeId ? Number(bikeId) : null,
      totalPrice: total,
      comment: comment.trim() || null,
    };

    if (schedMode === 'auto') {
      const n = Number(count);
      if (!Number.isInteger(n) || n <= 0 || n > 120 || !firstDate) {
        onError('Укажите корректные параметры графика');
        return;
      }
      payload.schedule = { firstDate, count: n, interval };
    } else if (schedMode === 'manual') {
      const rows = manualRows
        .filter((r) => r.dueDate && r.amount !== '')
        .map((r) => ({ dueDate: r.dueDate, amount: Number(r.amount) }));
      if (rows.length === 0) {
        onError('Добавьте хотя бы одну строку графика или выберите другой режим');
        return;
      }
      if (rows.some((r) => !Number.isFinite(r.amount) || r.amount <= 0)) {
        onError('В графике есть некорректные суммы');
        return;
      }
      payload.payments = rows;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/buyouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || 'Не удалось создать выкуп');
        return;
      }
      onNotice(`Выкуп #${json.id} создан`);
      setShowCreate(false);
      resetForm();
      onChanged();
    } catch {
      onError('Нет связи с сервером');
    } finally {
      setSaving(false);
    }
  };

  const patchBuyout = async (id: number, payload: any, okMsg: string) => {
    try {
      const res = await fetch(`/api/admin/buyouts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || 'Не удалось обновить выкуп');
        return;
      }
      onNotice(okMsg);
      onChanged();
    } catch {
      onError('Нет связи с сервером');
    }
  };

  const deleteBuyout = async (id: number) => {
    if (!window.confirm('Удалить выкуп вместе с графиком платежей?')) return;
    try {
      const res = await fetch(`/api/admin/buyouts/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || 'Не удалось удалить выкуп');
        return;
      }
      onNotice('Выкуп удалён');
      onChanged();
    } catch {
      onError('Нет связи с сервером');
    }
  };

  const patchPayment = async (id: number, payload: any) => {
    setRowBusy(id);
    try {
      const res = await fetch(`/api/admin/buyout-payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || 'Не удалось обновить платёж');
        return;
      }
      onChanged();
    } catch {
      onError('Нет связи с сервером');
    } finally {
      setRowBusy(null);
    }
  };

  const deletePayment = async (id: number) => {
    if (!window.confirm('Удалить строку графика?')) return;
    setRowBusy(id);
    try {
      const res = await fetch(`/api/admin/buyout-payments/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || 'Не удалось удалить платёж');
        return;
      }
      onChanged();
    } catch {
      onError('Нет связи с сервером');
    } finally {
      setRowBusy(null);
    }
  };

  const addPayment = async (buyoutId: number) => {
    const amount = Number(newPayAmount);
    if (!newPayDate) {
      onError('Укажите дату платежа');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      onError('Укажите корректную сумму платежа');
      return;
    }
    setRowBusy(-buyoutId);
    try {
      const res = await fetch(`/api/admin/buyouts/${buyoutId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: newPayDate, amount }),
      });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || 'Не удалось добавить платёж');
        return;
      }
      setNewPayDate('');
      setNewPayAmount('');
      onChanged();
    } catch {
      onError('Нет связи с сервером');
    } finally {
      setRowBusy(null);
    }
  };

  const autoPreview = schedMode === 'auto' ? previewSchedule() : [];
  const manualTotal = manualRows.reduce(
    (s, r) => s + (Number.isFinite(Number(r.amount)) ? Number(r.amount) : 0),
    0
  );

  return (
    <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-200">Аренда под выкуп</h2>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Создать выкуп
        </button>
      </div>

      {buyouts.length === 0 ? (
        <p className="text-slate-400 text-sm">Активных выкупов нет</p>
      ) : (
        <ul className="space-y-3">
          {buyouts.map((b) => {
            const total = Number(b.totalPrice);
            const paidSum = b.payments
              .filter((p) => p.status === 'PAID')
              .reduce((s, p) => s + Number(p.amount), 0);
            const scheduleSum = b.payments.reduce((s, p) => s + Number(p.amount), 0);
            const paidCount = b.payments.filter((p) => p.status === 'PAID').length;
            const nextPending = b.payments.find((p) => p.status === 'PENDING');
            const overdue = nextPending && new Date(nextPending.dueDate) < new Date();
            const scheduleMismatch = Math.abs(scheduleSum - total) > 0.01;

            return (
              <li key={b.id} className="border border-slate-800 rounded-lg p-3 bg-slate-950/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-100">
                      {b.title}
                      {b.bike && (
                        <span className="text-slate-400 font-normal">
                          {' '}· {b.bike.name}{b.bike.externalId ? ` (ID: ${b.bike.externalId})` : ''}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-400">
                      {b.clientName}{b.clientPhone ? ` · ${b.clientPhone}` : ''}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Оплачено {fmtMoney(paidSum)} из {fmtMoney(total)} · платежей {paidCount}/{b.payments.length}
                      {nextPending && (
                        <span className={overdue ? 'text-rose-400 font-medium' : ''}>
                          {' '}· ближайший: {fmtDate(nextPending.dueDate)} {fmtMoney(Number(nextPending.amount))}
                          {overdue ? ' (просрочен)' : ''}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap justify-end items-start">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        patchBuyout(b.id, { status: e.target.value }, 'Статус выкупа обновлён')
                      }
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                    >
                      {Object.entries(STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                    >
                      {expandedId === b.id ? 'Скрыть график' : 'График'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBuyout(b.id)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900 text-slate-300 rounded text-xs transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </div>

                {expandedId === b.id && (
                  <div className="mt-3 border-t border-slate-800 pt-3">
                    {scheduleMismatch && (
                      <p className="text-xs text-amber-400 mb-2">
                        Сумма графика {fmtMoney(scheduleSum)} отличается от стоимости выкупа {fmtMoney(total)}
                      </p>
                    )}
                    {b.payments.length === 0 ? (
                      <p className="text-slate-500 text-xs mb-2">График пуст — добавьте строки ниже</p>
                    ) : (
                      <ul className="space-y-1.5 mb-3">
                        {b.payments.map((p) => {
                          const paid = p.status === 'PAID';
                          const pOverdue = !paid && new Date(p.dueDate) < new Date();
                          return (
                            <li
                              key={p.id}
                              className={`flex flex-wrap items-center gap-2 text-xs rounded border px-2 py-1.5 ${
                                paid
                                  ? 'border-emerald-900 bg-emerald-950/20'
                                  : pOverdue
                                  ? 'border-rose-900 bg-rose-950/20'
                                  : 'border-slate-800 bg-slate-900/30'
                              }`}
                            >
                              <input
                                type="date"
                                defaultValue={toInputDate(p.dueDate)}
                                disabled={paid || rowBusy === p.id}
                                onBlur={(e) => {
                                  const v = e.target.value;
                                  if (v && v !== toInputDate(p.dueDate)) {
                                    patchPayment(p.id, { dueDate: v });
                                  }
                                }}
                                className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-200 disabled:opacity-50"
                              />
                              <input
                                type="number"
                                min={0}
                                defaultValue={Number(p.amount)}
                                disabled={paid || rowBusy === p.id}
                                onBlur={(e) => {
                                  const v = Number(e.target.value);
                                  if (Number.isFinite(v) && v > 0 && v !== Number(p.amount)) {
                                    patchPayment(p.id, { amount: v });
                                  }
                                }}
                                className="w-24 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-200 disabled:opacity-50"
                              />
                              <span className="text-slate-500">₽</span>
                              {p.comment && <span className="text-slate-500">· {p.comment}</span>}
                              <span className="ml-auto flex items-center gap-1.5">
                                {paid ? (
                                  <>
                                    <span className="text-emerald-400">
                                      Оплачен {p.paidAt ? fmtDate(p.paidAt) : ''}
                                      {p.method ? ` · ${METHOD_LABELS[p.method] || p.method}` : ''}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={rowBusy === p.id}
                                      onClick={() => patchPayment(p.id, { status: 'PENDING' })}
                                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors disabled:opacity-50"
                                    >
                                      Отменить оплату
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <select
                                      value={payMethods[p.id] || 'CASH'}
                                      onChange={(e) =>
                                        setPayMethods({ ...payMethods, [p.id]: e.target.value })
                                      }
                                      className="bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-white"
                                    >
                                      {Object.entries(METHOD_LABELS).map(([v, l]) => (
                                        <option key={v} value={v}>{l}</option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      disabled={rowBusy === p.id}
                                      onClick={() =>
                                        patchPayment(p.id, {
                                          status: 'PAID',
                                          method: payMethods[p.id] || 'CASH',
                                        })
                                      }
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors disabled:opacity-50"
                                    >
                                      Оплачен
                                    </button>
                                    <button
                                      type="button"
                                      disabled={rowBusy === p.id}
                                      onClick={() => deletePayment(p.id)}
                                      className="px-2 py-1 bg-slate-800 hover:bg-rose-900 text-slate-300 rounded transition-colors disabled:opacity-50"
                                    >
                                      ✕
                                    </button>
                                  </>
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-400">Добавить платёж:</span>
                      <input
                        type="date"
                        value={newPayDate}
                        onChange={(e) => setNewPayDate(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-200"
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder="Сумма"
                        value={newPayAmount}
                        onChange={(e) => setNewPayAmount(e.target.value)}
                        className="w-24 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-200"
                      />
                      <button
                        type="button"
                        disabled={rowBusy === -b.id}
                        onClick={() => addPayment(b.id)}
                        className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors disabled:opacity-50"
                      >
                        Добавить
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-slate-100">Новая аренда под выкуп</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Предмет</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  placeholder="Например: выкуп WENBOX U1 Pro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Клиент</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Телефон</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Байк (необязательно)</label>
                  <select
                    value={bikeId}
                    onChange={(e) => setBikeId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">— без привязки —</option>
                    {bikes.map((bike) => (
                      <option key={bike.id} value={bike.id}>
                        {bike.name}{bike.externalId ? ` (ID: ${bike.externalId})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Стоимость выкупа, ₽</label>
                  <input
                    type="number"
                    min={0}
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Комментарий</label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">График платежей</label>
                <div className="flex gap-2 mb-3">
                  {([['auto', 'Авто'], ['manual', 'Вручную'], ['none', 'Без графика']] as const).map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSchedMode(v)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        schedMode === v
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                {schedMode === 'auto' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Первый платёж</label>
                        <input
                          type="date"
                          value={firstDate}
                          onChange={(e) => setFirstDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Кол-во платежей</label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={count}
                          onChange={(e) => setCount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Периодичность</label>
                        <select
                          value={interval}
                          onChange={(e) => setInterval(e.target.value as 'WEEKLY' | 'MONTHLY')}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        >
                          <option value="WEEKLY">Еженедельно</option>
                          <option value="MONTHLY">Ежемесячно</option>
                        </select>
                      </div>
                    </div>
                    {autoPreview.length > 0 && (
                      <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/50 p-2">
                        <ul className="space-y-1 text-xs text-slate-400">
                          {autoPreview.map((r, i) => (
                            <li key={i} className="flex justify-between">
                              <span>{fmtDate(r.dueDate)}</span>
                              <span className="text-slate-200">{fmtMoney(r.amount)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {schedMode === 'manual' && (
                  <div className="space-y-2">
                    {manualRows.map((row, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="date"
                          value={row.dueDate}
                          onChange={(e) => {
                            const next = [...manualRows];
                            next[i] = { ...next[i], dueDate: e.target.value };
                            setManualRows(next);
                          }}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                        <input
                          type="number"
                          min={0}
                          placeholder="Сумма"
                          value={row.amount}
                          onChange={(e) => {
                            const next = [...manualRows];
                            next[i] = { ...next[i], amount: e.target.value };
                            setManualRows(next);
                          }}
                          className="w-28 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={() => setManualRows(manualRows.filter((_, j) => j !== i))}
                          className="px-2 py-1 bg-slate-800 hover:bg-rose-900 text-slate-300 rounded text-xs transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setManualRows([...manualRows, { dueDate: '', amount: '' }])
                        }
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                      >
                        + Строка
                      </button>
                      {manualRows.length > 0 && Number(totalPrice) > 0 && (
                        <span
                          className={`text-xs ${
                            Math.abs(manualTotal - Number(totalPrice)) > 0.01
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          Итого: {fmtMoney(manualTotal)} из {fmtMoney(Number(totalPrice))}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={createBuyout}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? 'Создание...' : 'Создать выкуп'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
                disabled={saving}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-sm transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
