'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ClientRating {
  code: 'BLACKLIST' | 'RISK' | 'WATCH' | 'RELIABLE' | 'NEW';
  label: string;
  reasons: string[];
}

interface ClientData {
  client: {
    id: number;
    name: string;
    phone: string;
    email?: string | null;
    telegramChatId?: string | null;
    maxChatId?: string | null;
    preferredMessenger?: string | null;
    balance: number;
    isBlacklisted: boolean;
    blacklistReason?: string | null;
    adminNote?: string | null;
    createdAt: string;
  };
  stats: {
    rentsCount: number;
    batteryRentsCount: number;
    totalRevenue: number;
    openDebt: number;
    leadsCount: number;
  };
  rating: ClientRating;
  rents: {
    id: number;
    itemType: 'BIKE' | 'BATTERY';
    itemName: string;
    itemExternalId?: string | null;
    status: string;
    startDate: string;
    endDate: string;
    actualReturnDate?: string | null;
    totalPrice: number;
    paidTotal: number;
    debt: number;
    comment?: string | null;
    createdAt: string;
  }[];
  timeline: {
    id: string;
    date: string;
    label: string;
    type: string;
    amount: number;
    method?: string | null;
    comment?: string | null;
  }[];
  leads: {
    id: number;
    itemType: string;
    bikeName?: string | null;
    status: string;
    totalPrice?: number | null;
    createdAt: string;
    rejectReason?: string | null;
  }[];
}

const RATING_STYLES: Record<ClientRating['code'], string> = {
  BLACKLIST: 'bg-rose-600/20 text-rose-300 border border-rose-500/40',
  RISK: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  WATCH: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  RELIABLE: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  NEW: 'bg-slate-700/40 text-slate-400 border border-slate-600/40',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Активна',
  RETURNED: 'Возвращена',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена',
  OVERDUE: 'Просрочена',
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-400',
  RETURNED: 'bg-slate-700/50 text-slate-300',
  COMPLETED: 'bg-blue-500/15 text-blue-400',
  CANCELLED: 'bg-slate-700/50 text-slate-500',
  OVERDUE: 'bg-rose-500/15 text-rose-400',
};

const TX_LABELS: Record<string, string> = {
  PAYMENT: 'Оплата',
  EXTEND: 'Продление',
  REFUND: 'Возврат',
  PENALTY: 'Штраф',
  DEPOSIT: 'Залог',
};

const LEAD_STATUS: Record<string, string> = {
  NEW: 'Новая',
  CONFIRMED: 'В работе',
  REJECTED: 'Отклонена',
  DONE: 'Выполнена',
};

const formatMoney = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;
const formatDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
const formatDateTime = (d: string) =>
  new Date(d).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function ClientCardPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [note, setNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [blReason, setBlReason] = useState('');
  const [blSaving, setBlSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/clients/${id}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Не удалось загрузить клиента');
        return;
      }
      setData(json);
      setNote(json.client.adminNote ?? '');
      setBlReason(json.client.blacklistReason ?? '');
    } catch {
      setError('Нет связи с сервером');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const saveNote = async () => {
    setNoteSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote: note || null }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Не удалось сохранить заметку');
        return;
      }
      setNotice('Заметка сохранена');
    } catch {
      setError('Нет связи с сервером');
    } finally {
      setNoteSaving(false);
    }
  };

  const toggleBlacklist = async () => {
    if (!data) return;
    const next = !data.client.isBlacklisted;
    if (next && !confirm(`Добавить «${data.client.name}» в чёрный список?`)) return;
    setBlSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isBlacklisted: next,
          blacklistReason: next ? blReason || null : null,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Не удалось обновить');
        return;
      }
      setNotice(next ? 'Клиент в чёрном списке' : 'Клиент убран из чёрного списка');
      await load();
    } catch {
      setError('Нет связи с сервером');
    } finally {
      setBlSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
        <p className="text-slate-400">Загрузка...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
        <p className="text-rose-400">{error || 'Клиент не найден'}</p>
        <Link href="/admin/clients" className="mt-4 inline-block text-cyan-400 hover:underline">
          ← К списку клиентов
        </Link>
      </div>
    );
  }

  const c = data.client;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin/clients" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
          ← Клиенты
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-white">{c.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${RATING_STYLES[data.rating.code]}`}>
            {data.rating.label}
          </span>
          {c.isBlacklisted && (
            <span className="px-3 py-1 rounded-full text-sm bg-rose-600/30 text-rose-200 border border-rose-500">
              В чёрном списке{c.blacklistReason ? `: ${c.blacklistReason}` : ''}
            </span>
          )}
        </div>

        {data.rating.reasons.length > 0 && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-sm">
            Основания рейтинга: {data.rating.reasons.join(' · ')}
          </div>
        )}

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Контакты и управление */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase">Контакты</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Телефон</span>
                <a href={`tel:${c.phone}`} className="text-cyan-400 hover:underline">{c.phone}</a>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Мессенджер</span>
                <span className="text-slate-200">{c.preferredMessenger || '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Telegram ID</span>
                <span className="text-slate-200">{c.telegramChatId || '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">MAX ID</span>
                <span className="text-slate-200">{c.maxChatId || '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-200">{c.email || '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Баланс</span>
                <span className="text-slate-200">{formatMoney(c.balance)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">С нами с</span>
                <span className="text-slate-200">{formatDate(c.createdAt)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <label className="mb-1 block text-xs font-medium text-slate-400">Причина ЧС</label>
              <input
                type="text"
                value={blReason}
                onChange={(e) => setBlReason(e.target.value)}
                placeholder="Например: угнал байк 12.10"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={toggleBlacklist}
                disabled={blSaving}
                className={`mt-3 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  c.isBlacklisted
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-rose-700 hover:bg-rose-600 text-white'
                }`}
              >
                {c.isBlacklisted ? 'Убрать из чёрного списка' : 'В чёрный список'}
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase mb-3">Статистика</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-950/60 p-3">
                <p className="text-xs text-slate-500">Аренд байков</p>
                <p className="text-xl font-bold text-white">{data.stats.rentsCount}</p>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-3">
                <p className="text-xs text-slate-500">Аренд АКБ</p>
                <p className="text-xl font-bold text-white">{data.stats.batteryRentsCount}</p>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-3">
                <p className="text-xs text-slate-500">Принёс выручки</p>
                <p className="text-xl font-bold text-emerald-400">{formatMoney(data.stats.totalRevenue)}</p>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-3">
                <p className="text-xs text-slate-500">Открытый долг</p>
                <p className={`text-xl font-bold ${data.stats.openDebt > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                  {formatMoney(data.stats.openDebt)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-3 col-span-2">
                <p className="text-xs text-slate-500">Заявок с этого телефона</p>
                <p className="text-xl font-bold text-slate-200">{data.stats.leadsCount}</p>
              </div>
            </div>
          </div>

          {/* Заметки */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase mb-3">Заметка менеджера</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={6}
              placeholder="Особенности клиента, договорённости, паспортные данные и т.п."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 resize-y"
            />
            <button
              onClick={saveNote}
              disabled={noteSaving}
              className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Сохранить заметку
            </button>
          </div>
        </div>

        {/* История аренд */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-400 uppercase">История аренд</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr className="text-left text-xs text-slate-400 uppercase">
                  <th className="p-4">#</th>
                  <th className="p-4">Предмет</th>
                  <th className="p-4">Период</th>
                  <th className="p-4">Возврат</th>
                  <th className="p-4">Сумма</th>
                  <th className="p-4">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.rents.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Аренд не было</td></tr>
                ) : (
                  data.rents.map((r) => (
                    <tr key={`${r.itemType}-${r.id}`} className="hover:bg-slate-800/30">
                      <td className="p-4 text-slate-400">{r.id}</td>
                      <td className="p-4 text-slate-200">
                        {r.itemType === 'BATTERY' ? '🔋 ' : ''}
                        {r.itemName}
                        {r.itemExternalId ? <span className="text-slate-500"> (ID: {r.itemExternalId})</span> : null}
                      </td>
                      <td className="p-4 text-slate-300 text-sm">
                        {formatDate(r.startDate)} — {formatDate(r.endDate)}
                      </td>
                      <td className="p-4 text-slate-300 text-sm">{formatDate(r.actualReturnDate)}</td>
                      <td className="p-4">
                        <span className="text-emerald-400 font-medium">{formatMoney(r.totalPrice)}</span>
                        {r.debt > 0 && (
                          <span className="block text-xs text-rose-400">долг {formatMoney(r.debt)}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${STATUS_STYLES[r.status] || 'bg-slate-700/50 text-slate-300'}`}>
                          {STATUS_LABELS[r.status] || r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Лента платежей */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase mb-3">Платежи</h2>
            {data.timeline.length === 0 ? (
              <p className="text-sm text-slate-500">Платежей не было</p>
            ) : (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {data.timeline.map((t) => (
                  <li key={t.id} className="text-sm border-b border-slate-800/60 pb-2 last:border-0">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-300">
                        {TX_LABELS[t.type] || t.type} · {t.label}
                      </span>
                      <span className={t.type === 'REFUND' ? 'text-rose-400' : 'text-emerald-400'}>
                        {t.type === 'REFUND' ? '−' : ''}
                        {formatMoney(t.amount)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {formatDateTime(t.date)}
                      {t.method ? ` · ${t.method}` : ''}
                      {t.comment ? ` · ${t.comment}` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Заявки */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase mb-3">Заявки с сайта</h2>
            {data.leads.length === 0 ? (
              <p className="text-sm text-slate-500">Заявок не было</p>
            ) : (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {data.leads.map((l) => (
                  <li key={l.id} className="text-sm border-b border-slate-800/60 pb-2 last:border-0">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-300">
                        #{l.id} · {l.itemType === 'BATTERY' ? '🔋 ' : ''}{l.bikeName || '—'}
                      </span>
                      <span className="text-slate-400">{LEAD_STATUS[l.status] || l.status}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {formatDateTime(l.createdAt)}
                      {l.totalPrice != null ? ` · ${formatMoney(Number(l.totalPrice))}` : ''}
                      {l.rejectReason ? ` · отказ: ${l.rejectReason}` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
