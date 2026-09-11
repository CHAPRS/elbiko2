'use client';

import React, { useEffect, useState } from 'react';

interface BikeStat {
  id: number;
  name: string;
  externalId: string | null;
  rentDays: number;
  rentCount: number;
  revenue: number;
  avgCheck: number;
  utilization: number;
}

interface StatsData {
  from: string;
  to: string;
  totalDays: number;
  bikes: BikeStat[];
  totals: {
    rentDays: number;
    rentCount: number;
    revenue: number;
    avgCheck: number;
    utilization: number;
  };
}

function toInputDate(d: Date): string {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function startOfWeek(d: Date): Date {
  const day = d.getDay() || 7;
  const out = new Date(d);
  out.setDate(d.getDate() - day + 1);
  out.setHours(0, 0, 0, 0);
  return out;
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function endOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 11, 31);
}

const PRESETS = [
  { label: 'Неделя', from: startOfWeek(new Date()), to: new Date() },
  { label: 'Месяц', from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
  { label: 'Год', from: startOfYear(new Date()), to: endOfYear(new Date()) },
  { label: 'Всё', from: new Date(2020, 0, 1), to: new Date() },
];

export default function BikeStatsPage() {
  const [from, setFrom] = useState(toInputDate(startOfMonth(new Date())));
  const [to, setTo] = useState(toInputDate(endOfMonth(new Date())));
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/bikes/stats?from=${from}&to=${to}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [from, to]);

  const applyPreset = (fromDate: Date, toDate: Date) => {
    setFrom(toInputDate(fromDate));
    setTo(toInputDate(toDate));
  };

  const formatMoney = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent mb-8">
          Статистика по байкам
        </h1>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.from, p.to)}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <div>
              <label className="block text-xs text-slate-400 mb-1">С</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">По</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isLoading ? '...' : 'Обновить'}
            </button>
          </div>
        </div>

        {data && (
          <>
            <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">Период</div>
                <div className="text-lg font-bold text-white">{data.totalDays} дн.</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">Аренд</div>
                <div className="text-lg font-bold text-emerald-400">{data.totals.rentCount}</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">Арендных дней</div>
                <div className="text-lg font-bold text-blue-400">{data.totals.rentDays}</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">Выручка</div>
                <div className="text-lg font-bold text-amber-500">{formatMoney(data.totals.revenue)}</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">Средняя загрузка</div>
                <div className="text-lg font-bold text-violet-400">{data.totals.utilization}%</div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Байк</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Аренд</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Дней в аренде</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Выручка</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Средний чек</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Загрузка</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bikes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">Нет данных за период</td>
                    </tr>
                  ) : (
                    data.bikes.map((bike) => (
                      <tr key={bike.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 text-white font-medium">
                          {bike.name}
                          {bike.externalId ? <span className="block text-xs text-slate-500">ID: {bike.externalId}</span> : null}
                        </td>
                        <td className="p-4 text-slate-300">{bike.rentCount}</td>
                        <td className="p-4 text-slate-300">{bike.rentDays}</td>
                        <td className="p-4 text-emerald-400 font-medium">{formatMoney(bike.revenue)}</td>
                        <td className="p-4 text-slate-300">{formatMoney(bike.avgCheck)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-violet-500"
                                style={{ width: `${Math.min(100, bike.utilization)}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-300">{bike.utilization}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
