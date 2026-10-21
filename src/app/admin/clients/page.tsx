'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ClientRating {
  code: 'BLACKLIST' | 'RISK' | 'WATCH' | 'RELIABLE' | 'NEW';
  label: string;
  reasons: string[];
}

interface Client {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  preferredMessenger?: string | null;
  isBlacklisted: boolean;
  createdAt: string;
  rentsCount: number;
  batteryRentsCount: number;
  revenue: number;
  openDebt: number;
  lastRentAt?: string | null;
  rating: ClientRating;
}

const RATING_STYLES: Record<ClientRating['code'], string> = {
  BLACKLIST: 'bg-rose-600/20 text-rose-300 border border-rose-500/40',
  RISK: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  WATCH: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  RELIABLE: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  NEW: 'bg-slate-700/40 text-slate-400 border border-slate-600/40',
};

const formatMoney = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;
const formatDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'ALL' | 'RISK' | 'RELIABLE' | 'NEW'>('ALL');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const json = await res.json();
        setClients(json.clients || []);
      })
      .catch(() => setError('Не удалось загрузить клиентов'))
      .finally(() => setLoading(false));
  }, []);

  const q = query.toLowerCase().trim();
  const visible = clients.filter((c) => {
    if (q && ![c.name, c.phone, c.email ?? ''].some((v) => v.toLowerCase().includes(q))) return false;
    if (ratingFilter === 'ALL') return true;
    if (ratingFilter === 'RISK') return ['RISK', 'BLACKLIST', 'WATCH'].includes(c.rating.code);
    return c.rating.code === ratingFilter;
  });

  const riskCount = clients.filter((c) => ['RISK', 'BLACKLIST'].includes(c.rating.code)).length;
  const debtTotal = clients.reduce((s, c) => s + c.openDebt, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Клиенты
          </h1>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: имя, телефон, email"
            className="w-72 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase mb-1">Клиентов</p>
            <p className="text-2xl font-bold text-white">{clients.length}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase mb-1">Под риском</p>
            <p className={`text-2xl font-bold ${riskCount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>{riskCount}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase mb-1">Открытые долги</p>
            <p className={`text-2xl font-bold ${debtTotal > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
              {formatMoney(debtTotal)}
            </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase mb-1">Совокупная выручка</p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatMoney(clients.reduce((s, c) => s + c.revenue, 0))}
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          {(
            [
              ['ALL', 'Все'],
              ['RISK', 'С рисками'],
              ['RELIABLE', 'Надёжные'],
              ['NEW', 'Новые'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRatingFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                ratingFilter === key
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr className="text-left text-xs text-slate-400 uppercase">
                  <th className="p-4">Клиент</th>
                  <th className="p-4">Контакты</th>
                  <th className="p-4">Рейтинг</th>
                  <th className="p-4">Аренд</th>
                  <th className="p-4">Выручка</th>
                  <th className="p-4">Долг</th>
                  <th className="p-4">Последняя аренда</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Загрузка...</td></tr>
                ) : visible.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Клиенты не найдены</td></tr>
                ) : (
                  visible.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <Link
                          href={`/admin/clients/${c.id}`}
                          className="text-white font-medium hover:text-cyan-400 transition-colors"
                        >
                          {c.name}
                        </Link>
                        <span className="block text-xs text-slate-500">ID: {c.id}</span>
                      </td>
                      <td className="p-4 text-slate-300 text-sm">
                        <div>{c.phone}</div>
                        {c.email && <div className="text-slate-500">{c.email}</div>}
                      </td>
                      <td className="p-4">
                        <span
                          title={c.rating.reasons.join('; ') || undefined}
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${RATING_STYLES[c.rating.code]}`}
                        >
                          {c.rating.label}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">
                        {c.rentsCount + c.batteryRentsCount}
                        {c.batteryRentsCount > 0 && (
                          <span className="block text-xs text-slate-500">АКБ: {c.batteryRentsCount}</span>
                        )}
                      </td>
                      <td className="p-4 text-emerald-400">{formatMoney(c.revenue)}</td>
                      <td className="p-4">
                        {c.openDebt > 0 ? (
                          <span className="text-rose-400 font-medium">{formatMoney(c.openDebt)}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 text-sm">{formatDate(c.lastRentAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
