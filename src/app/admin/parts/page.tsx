'use client';

import React, { useState, useEffect } from 'react';

interface Part {
  id: number;
  name: string;
  sku?: string | null;
  category?: string | null;
  unit: string;
  stockQty: number;
  minQty?: number | null;
  lastPrice?: number | null;
  comment?: string | null;
  _count?: { transactions: number };
}

interface PartTransaction {
  id: number;
  kind: string;
  qty: number;
  price?: number | null;
  bikeId?: number | null;
  bike?: { id: number; name: string; externalId?: string | null } | null;
  comment?: string | null;
  createdAt: string;
}

interface Bike {
  id: number;
  name: string;
  externalId?: string | null;
  status: string;
}

const KIND_LABELS: Record<string, string> = {
  IN: 'Приход',
  OUT: 'Списание',
  ADJUST: 'Корректировка',
};

const KIND_COLORS: Record<string, string> = {
  IN: 'text-emerald-400',
  OUT: 'text-rose-400',
  ADJUST: 'text-amber-400',
};

const formatMoney = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;
const formatQty = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [totals, setTotals] = useState({ positions: 0, units: 0, value: 0 });
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editingPart, setEditingPart] = useState<Part | 'new' | null>(null);
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formUnit, setFormUnit] = useState('шт');
  const [formMinQty, setFormMinQty] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formBusy, setFormBusy] = useState(false);

  const [txPart, setTxPart] = useState<Part | null>(null);
  const [txKind, setTxKind] = useState<'IN' | 'OUT' | 'ADJUST'>('IN');
  const [txQty, setTxQty] = useState('');
  const [txNewStock, setTxNewStock] = useState('');
  const [txPrice, setTxPrice] = useState('');
  const [txBikeId, setTxBikeId] = useState('');
  const [txComment, setTxComment] = useState('');
  const [txBusy, setTxBusy] = useState(false);

  const [historyId, setHistoryId] = useState<number | null>(null);
  const [history, setHistory] = useState<PartTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchParts = async () => {
    try {
      const res = await fetch('/api/admin/parts');
      const json = await res.json();
      if (res.ok) {
        setParts(json.parts);
        setTotals(json.totals);
      }
    } catch (err) {
      console.error('Ошибка загрузки склада:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
    fetch('/api/admin/bikes')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setBikes(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Ошибка загрузки автопарка:', err));
  }, []);

  const openForm = (part: Part | 'new') => {
    setEditingPart(part);
    setFormName(part === 'new' ? '' : part.name);
    setFormSku(part === 'new' ? '' : part.sku ?? '');
    setFormCategory(part === 'new' ? '' : part.category ?? '');
    setFormUnit(part === 'new' ? 'шт' : part.unit);
    setFormMinQty(part === 'new' ? '' : part.minQty != null ? String(part.minQty) : '');
    setFormComment(part === 'new' ? '' : part.comment ?? '');
    setError(null);
    setNotice(null);
  };

  const saveForm = async () => {
    if (!formName.trim()) {
      setError('Укажите название');
      return;
    }
    setFormBusy(true);
    setError(null);
    try {
      const isNew = editingPart === 'new';
      const res = await fetch(isNew ? '/api/admin/parts' : `/api/admin/parts/${(editingPart as Part).id}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          sku: formSku || null,
          category: formCategory || null,
          unit: formUnit || 'шт',
          minQty: formMinQty === '' ? null : Number(formMinQty),
          comment: formComment || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Не удалось сохранить');
        return;
      }
      setNotice(isNew ? 'Позиция добавлена' : 'Позиция обновлена');
      setEditingPart(null);
      fetchParts();
    } catch {
      setError('Нет связи с сервером');
    } finally {
      setFormBusy(false);
    }
  };

  const handleDelete = async (part: Part) => {
    if (!confirm(`Удалить «${part.name}» вместе с историей движений?`)) return;
    const res = await fetch(`/api/admin/parts/${part.id}`, { method: 'DELETE' });
    if (res.ok) {
      setNotice('Позиция удалена');
      if (historyId === part.id) setHistoryId(null);
      fetchParts();
    }
  };

  const openTx = (part: Part, kind: 'IN' | 'OUT' | 'ADJUST') => {
    setTxPart(part);
    setTxKind(kind);
    setTxQty('');
    setTxNewStock(String(Number(part.stockQty)));
    setTxPrice(part.lastPrice != null ? String(part.lastPrice) : '');
    setTxBikeId('');
    setTxComment('');
    setError(null);
    setNotice(null);
  };

  const submitTx = async () => {
    if (!txPart) return;
    let qtyVal: number;
    if (txKind === 'ADJUST') {
      const target = Number(txNewStock);
      if (!Number.isFinite(target) || target < 0) {
        setError('Укажите корректный новый остаток');
        return;
      }
      qtyVal = Math.round((target - Number(txPart.stockQty)) * 100) / 100;
      if (qtyVal === 0) {
        setError('Остаток не изменился');
        return;
      }
    } else {
      qtyVal = Number(txQty);
      if (!Number.isFinite(qtyVal) || qtyVal <= 0) {
        setError('Укажите количество больше нуля');
        return;
      }
    }

    setTxBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/parts/${txPart.id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: txKind,
          qty: qtyVal,
          price: txPrice === '' ? undefined : Number(txPrice),
          bikeId: txKind === 'OUT' && txBikeId ? Number(txBikeId) : undefined,
          comment: txComment || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Не удалось провести операцию');
        return;
      }
      const labels: Record<string, string> = { IN: 'Приход проведён', OUT: 'Списание проведено', ADJUST: 'Остаток скорректирован' };
      setNotice(labels[txKind]);
      setTxPart(null);
      if (historyId) toggleHistory({ id: historyId } as Part, true);
      fetchParts();
    } catch {
      setError('Нет связи с сервером');
    } finally {
      setTxBusy(false);
    }
  };

  const toggleHistory = async (part: Part, force = false) => {
    if (historyId === part.id && !force) {
      setHistoryId(null);
      return;
    }
    setHistoryId(part.id);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/admin/parts/${part.id}/transactions`);
      if (res.ok) setHistory(await res.json());
    } catch (err) {
      console.error('Ошибка загрузки истории:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const stockValue = (p: Part) => Number(p.stockQty) * Number(p.lastPrice ?? 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Склад запчастей
          </h1>
          <button
            onClick={() => openForm('new')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Новая позиция
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase mb-1">Позиций</p>
            <p className="text-2xl font-bold text-white">{totals.positions}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase mb-1">Единиц на складе</p>
            <p className="text-2xl font-bold text-white">{formatQty(totals.units)}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase mb-1">Запасов на сумму</p>
            <p className="text-2xl font-bold text-amber-400">{formatMoney(totals.value)}</p>
            <p className="text-xs text-slate-500 mt-1">по цене последней закупки</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr className="text-left text-xs text-slate-400 uppercase">
                  <th className="p-4">Название</th>
                  <th className="p-4">Артикул</th>
                  <th className="p-4">Категория</th>
                  <th className="p-4">Остаток</th>
                  <th className="p-4">Цена закупки</th>
                  <th className="p-4">Сумма</th>
                  <th className="p-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Загрузка...</td></tr>
                ) : parts.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Склад пуст — добавьте первую позицию</td></tr>
                ) : (
                  parts.map((p) => (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-slate-800/30">
                        <td className="p-4">
                          <span className="text-white font-medium">{p.name}</span>
                          {p.comment && <span className="block text-xs text-slate-500">{p.comment}</span>}
                        </td>
                        <td className="p-4 text-slate-400">{p.sku || '—'}</td>
                        <td className="p-4 text-slate-400">{p.category || '—'}</td>
                        <td className="p-4">
                          <span className={`font-medium ${Number(p.stockQty) > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {formatQty(Number(p.stockQty))} {p.unit}
                          </span>
                          {p.minQty != null && Number(p.stockQty) <= Number(p.minQty) && (
                            <span className="ml-2 text-xs bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded-full">мало</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-300">{p.lastPrice != null ? formatMoney(Number(p.lastPrice)) : '—'}</td>
                        <td className="p-4 text-amber-400">{formatMoney(stockValue(p))}</td>
                        <td className="p-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => openTx(p, 'IN')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs transition-colors"
                          >
                            + Приход
                          </button>
                          <button
                            onClick={() => openTx(p, 'OUT')}
                            className="px-2 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-xs transition-colors"
                          >
                            − Списать
                          </button>
                          <button
                            onClick={() => openTx(p, 'ADJUST')}
                            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition-colors"
                          >
                            Корр.
                          </button>
                          <button
                            onClick={() => toggleHistory(p)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                          >
                            {historyId === p.id ? 'Скрыть' : 'История'}
                          </button>
                          <button
                            onClick={() => openForm(p)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                          >
                            Ред.
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="px-2 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded text-xs transition-colors"
                          >
                            Удал.
                          </button>
                        </td>
                      </tr>
                      {historyId === p.id && (
                        <tr>
                          <td colSpan={7} className="p-0 bg-slate-950/60">
                            <div className="p-4">
                              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">История движений</h4>
                              {historyLoading ? (
                                <p className="text-sm text-slate-400">Загрузка...</p>
                              ) : history.length === 0 ? (
                                <p className="text-sm text-slate-500">Движений пока не было</p>
                              ) : (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs text-slate-500 border-b border-slate-800">
                                      <th className="pb-2 text-left font-medium">Дата</th>
                                      <th className="pb-2 text-left font-medium">Операция</th>
                                      <th className="pb-2 text-left font-medium">Кол-во</th>
                                      <th className="pb-2 text-left font-medium">Цена</th>
                                      <th className="pb-2 text-left font-medium">Байк</th>
                                      <th className="pb-2 text-left font-medium">Комментарий</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800/60">
                                    {history.map((t) => (
                                      <tr key={t.id}>
                                        <td className="py-2 text-slate-400 whitespace-nowrap">{formatDate(t.createdAt)}</td>
                                        <td className={`py-2 font-medium ${KIND_COLORS[t.kind] || 'text-slate-300'}`}>
                                          {KIND_LABELS[t.kind] || t.kind}
                                        </td>
                                        <td className="py-2 text-slate-200">
                                          {t.kind === 'ADJUST' && Number(t.qty) > 0 ? '+' : t.kind === 'OUT' ? '−' : ''}
                                          {formatQty(Math.abs(Number(t.qty)))} {p.unit}
                                        </td>
                                        <td className="py-2 text-slate-300">{t.price != null ? formatMoney(Number(t.price)) : '—'}</td>
                                        <td className="py-2 text-slate-300">
                                          {t.bike ? `${t.bike.name}${t.bike.externalId ? ` (ID: ${t.bike.externalId})` : ''}` : '—'}
                                        </td>
                                        <td className="py-2 text-slate-500">{t.comment || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Модал создания/редактирования позиции */}
        {editingPart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
              <h2 className="mb-4 text-lg font-semibold text-slate-100">
                {editingPart === 'new' ? 'Новая позиция' : `Редактирование: ${(editingPart as Part).name}`}
              </h2>

              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-slate-400">Название *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Покрышка 20x4.0"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Артикул</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Единица</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Категория</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Расходники"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Мин. остаток</label>
                  <input
                    type="number"
                    min="0"
                    value={formMinQty}
                    onChange={(e) => setFormMinQty(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-slate-400">Комментарий</label>
                <input
                  type="text"
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => !formBusy && setEditingPart(null)}
                  disabled={formBusy}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={saveForm}
                  disabled={formBusy}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-500 disabled:opacity-50 transition-colors"
                >
                  {formBusy ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модал складской операции */}
        {txPart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
              <h2 className="mb-1 text-lg font-semibold text-slate-100">
                {txKind === 'IN' ? 'Приход' : txKind === 'OUT' ? 'Списание' : 'Корректировка'}: {txPart.name}
              </h2>
              <p className="mb-4 text-sm text-slate-400">
                На складе: {formatQty(Number(txPart.stockQty))} {txPart.unit}
                {txPart.lastPrice != null && ` · последняя цена ${formatMoney(Number(txPart.lastPrice))}`}
              </p>

              <div className="mb-3 flex gap-2">
                {([
                  { value: 'IN', label: 'Приход' },
                  { value: 'OUT', label: 'Списание' },
                  { value: 'ADJUST', label: 'Корректировка' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTxKind(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      txKind === opt.value
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {txKind === 'ADJUST' ? (
                <div className="mb-4">
                  <label className="mb-1 block text-xs font-medium text-slate-400">Новый остаток, {txPart.unit}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={txNewStock}
                    onChange={(e) => setTxNewStock(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label className="mb-1 block text-xs font-medium text-slate-400">Количество, {txPart.unit} *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={txQty}
                    onChange={(e) => setTxQty(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  {txKind === 'OUT' && Number(txQty) > Number(txPart.stockQty) && (
                    <p className="mt-1 text-xs text-rose-400">На складе только {formatQty(Number(txPart.stockQty))} {txPart.unit}</p>
                  )}
                </div>
              )}

              {txKind !== 'ADJUST' && (
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">
                      {txKind === 'IN' ? 'Цена закупки за ед., ₽' : 'Цена списания за ед., ₽'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={txPrice}
                      onChange={(e) => setTxPrice(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {txKind === 'OUT' ? (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">Установлено на байк</label>
                      <select
                        value={txBikeId}
                        onChange={(e) => setTxBikeId(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="">— без привязки —</option>
                        {bikes.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}{b.externalId ? ` (ID: ${b.externalId})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
              )}

              {txKind === 'OUT' && Number(txQty) > 0 && Number(txPrice) > 0 && (
                <p className="mb-4 text-xs text-amber-400">
                  В расходы уйдёт: {formatMoney(Number(txQty) * Number(txPrice))}
                  {txBikeId ? ' на выбранный байк' : ' без привязки к байку'}
                </p>
              )}

              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-slate-400">Комментарий</label>
                <input
                  type="text"
                  value={txComment}
                  onChange={(e) => setTxComment(e.target.value)}
                  placeholder={txKind === 'IN' ? 'Поставщик, накладная...' : 'Причина...'}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => !txBusy && setTxPart(null)}
                  disabled={txBusy}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={submitTx}
                  disabled={txBusy}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-500 disabled:opacity-50 transition-colors"
                >
                  {txBusy ? 'Сохранение...' : 'Провести'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
