'use client';

import React, { useEffect, useState } from 'react';

interface BikeStat {
  id: number;
  name: string;
  externalId: string | null;
  purchasePrice: number | null;
  purchaseDate: string | null;
  mileage: number | null;
  rentDays: number;
  rentCount: number;
  revenue: number;
  avgCheck: number;
  utilization: number;
  expenses: number;
  expenseCount: number;
  profit: number;
  repairCount: number;
  repairSum: number;
  paybackPct: number | null;
  paybackNet: number | null;
}

interface ExpenseItem {
  id: number;
  title: string;
  amount: number;
  method?: string | null;
  category?: string | null;
  comment?: string | null;
  createdAt: string;
}

interface CategorySum {
  category: string;
  sum: number;
  count: number;
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
    expenses: number;
    expenseCount: number;
    profit: number;
    unassignedExpenses: number;
    unassignedCount: number;
  };
  expenseByCategory?: CategorySum[];
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Наличные',
  SBP: 'СБП',
  CARD: 'Карта',
  TRANSFER: 'Перевод',
};

const CATEGORY_LABELS: Record<string, string> = {
  REPAIR: 'Ремонт',
  SERVICE: 'ТО',
  BATTERY: 'Аккумулятор',
  BATTERY_RENT: 'Аренда аккумулятора',
  ACCESSORIES: 'Аксессуары',
  GOODS: 'Сопутствующие товары',
  OTHER: 'Прочее',
  NONE: 'Без категории',
};

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
  const [expandedId, setExpandedId] = useState<number | 'unassigned' | null>(null);
  const [expenseDetails, setExpenseDetails] = useState<ExpenseItem[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    setExpandedId(null);
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

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

  const toggleExpenses = async (id: number | 'unassigned') => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    setDetailsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/finance?kind=EXPENSE&from=${from}T00:00:00&to=${to}T23:59:59&take=500`
      );
      const json = (await res.json()) as (ExpenseItem & { bikeId?: number | null })[];
      if (res.ok && Array.isArray(json)) {
        setExpenseDetails(
          id === 'unassigned'
            ? json.filter((item) => item.bikeId == null)
            : json.filter((item) => item.bikeId === id)
        );
      }
    } catch (err) {
      console.error('Ошибка загрузки расходов:', err);
      setExpenseDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const renderExpenseDetails = (colSpan: number) => (
    <tr className="border-b border-slate-800 bg-slate-950/60">
      <td colSpan={colSpan} className="p-4">
        {detailsLoading ? (
          <p className="text-sm text-slate-400">Загрузка расходов...</p>
        ) : expenseDetails.length === 0 ? (
          <p className="text-sm text-slate-400">Нет расходов за период</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase">
                <th className="text-left py-1 pr-4 font-medium">Дата</th>
                <th className="text-left py-1 pr-4 font-medium">Предмет</th>
                <th className="text-left py-1 pr-4 font-medium">Категория</th>
                <th className="text-left py-1 pr-4 font-medium">Способ</th>
                <th className="text-right py-1 pr-4 font-medium">Сумма</th>
                <th className="text-left py-1 font-medium">Комментарий</th>
              </tr>
            </thead>
            <tbody>
              {expenseDetails.map((item) => (
                <tr key={item.id} className="border-t border-slate-800/60">
                  <td className="py-1.5 pr-4 text-slate-400 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                  <td className="py-1.5 pr-4 text-slate-200">{item.title}</td>
                  <td className="py-1.5 pr-4 text-slate-400">{item.category ? (CATEGORY_LABELS[item.category] ?? item.category) : '—'}</td>
                  <td className="py-1.5 pr-4 text-slate-400">{item.method ? (METHOD_LABELS[item.method] ?? item.method) : '—'}</td>
                  <td className="py-1.5 pr-4 text-right text-rose-300 font-medium">{formatMoney(Number(item.amount))}</td>
                  <td className="py-1.5 text-slate-400">{item.comment || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </td>
    </tr>
  );

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
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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
                <div className="text-xs text-slate-400">Расходы</div>
                <div className="text-lg font-bold text-rose-400">{formatMoney(data.totals.expenses + data.totals.unassignedExpenses)}</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">Прибыль</div>
                <div className={`text-lg font-bold ${data.totals.profit - data.totals.unassignedExpenses >= 0 ? 'text-lime-400' : 'text-rose-400'}`}>
                  {formatMoney(data.totals.profit - data.totals.unassignedExpenses)}
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">Средняя загрузка</div>
                <div className="text-lg font-bold text-violet-400">{data.totals.utilization}%</div>
              </div>
            </div>

            {data.expenseByCategory && data.expenseByCategory.length > 0 && (
              <div className="mb-6 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400 mb-3">Расходы по категориям за период</div>
                <div className="flex flex-wrap gap-3">
                  {data.expenseByCategory.map((c) => (
                    <div
                      key={c.category}
                      className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2"
                    >
                      <span className="text-xs text-slate-400">
                        {CATEGORY_LABELS[c.category] ?? c.category}
                        <span className="text-slate-600"> ({c.count})</span>
                      </span>
                      <span className="text-sm font-bold text-rose-400">{formatMoney(c.sum)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Байк</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Аренд</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Дней в аренде</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Выручка</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Расходы</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Прибыль</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Закупка</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Пробег</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Средний чек</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Загрузка</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Окупаемость</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bikes.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-4 text-center text-slate-400">Нет данных за период</td>
                    </tr>
                  ) : (
                    data.bikes.map((bike) => (
                      <React.Fragment key={bike.id}>
                        <tr className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                          <td className="p-4 text-white font-medium">
                            {bike.name}
                            {bike.externalId ? <span className="block text-xs text-slate-500">ID: {bike.externalId}</span> : null}
                          </td>
                          <td className="p-4 text-slate-300">{bike.rentCount}</td>
                          <td className="p-4 text-slate-300">{bike.rentDays}</td>
                          <td className="p-4 text-emerald-400 font-medium">{formatMoney(bike.revenue)}</td>
                          <td className="p-4">
                            {bike.expenseCount > 0 ? (
                              <>
                                <button
                                  onClick={() => toggleExpenses(bike.id)}
                                  className="text-rose-400 font-medium hover:text-rose-300 underline decoration-dotted underline-offset-4 transition-colors"
                                  title="Показать детализацию расходов"
                                >
                                  {formatMoney(bike.expenses)}
                                  <span className="text-xs text-slate-500 ml-1">({bike.expenseCount})</span>
                                  <span className="ml-1 text-xs">{expandedId === bike.id ? '▲' : '▼'}</span>
                                </button>
                                {bike.repairCount > 0 && (
                                  <span className="block text-xs text-rose-300/80 mt-0.5">
                                    ремонтов: {bike.repairCount} на {formatMoney(bike.repairSum)}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className={`p-4 font-medium ${bike.profit >= 0 ? 'text-lime-400' : 'text-rose-400'}`}>
                            {formatMoney(bike.profit)}
                          </td>
                          <td className="p-4 text-slate-300">
                            {bike.purchasePrice != null ? (
                              <>
                                {formatMoney(bike.purchasePrice)}
                                {bike.purchaseDate && (
                                  <span className="block text-xs text-slate-500">{formatDate(bike.purchaseDate)}</span>
                                )}
                              </>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="p-4 text-slate-300">{bike.mileage != null ? `${bike.mileage} км` : '—'}</td>
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
                          <td className="p-4">
                            {bike.paybackPct == null ? (
                              <span className="text-slate-500">—</span>
                            ) : (
                              <div className="min-w-28">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${bike.paybackPct >= 100 ? 'bg-lime-500' : 'bg-amber-500'}`}
                                      style={{ width: `${Math.min(100, Math.max(0, bike.paybackPct))}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-slate-300">{bike.paybackPct}%</span>
                                </div>
                                <span className={`block text-xs mt-1 ${bike.paybackPct >= 100 ? 'text-lime-400' : 'text-slate-500'}`}>
                                  {bike.paybackPct >= 100
                                    ? `окуплен +${formatMoney(bike.paybackNet ?? 0)}`
                                    : `осталось ${formatMoney(Math.abs(bike.paybackNet ?? 0))}`}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                        {expandedId === bike.id && renderExpenseDetails(11)}
                      </React.Fragment>
                    ))
                  )}
                  {data.totals.unassignedCount > 0 && (
                    <>
                      <tr className="border-b border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 text-slate-300 font-medium">
                          Без привязки к байку
                          <span className="block text-xs text-slate-500">общие расходы</span>
                        </td>
                        <td className="p-4 text-slate-500">—</td>
                        <td className="p-4 text-slate-500">—</td>
                        <td className="p-4 text-slate-500">—</td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleExpenses('unassigned')}
                            className="text-rose-400 font-medium hover:text-rose-300 underline decoration-dotted underline-offset-4 transition-colors"
                            title="Показать детализацию расходов"
                          >
                            {formatMoney(data.totals.unassignedExpenses)}
                            <span className="text-xs text-slate-500 ml-1">({data.totals.unassignedCount})</span>
                            <span className="ml-1 text-xs">{expandedId === 'unassigned' ? '▲' : '▼'}</span>
                          </button>
                        </td>
                        <td className="p-4 text-slate-500">—</td>
                        <td className="p-4 text-slate-500">—</td>
                        <td className="p-4 text-slate-500">—</td>
                        <td className="p-4 text-slate-500">—</td>
                        <td className="p-4 text-slate-500">—</td>
                        <td className="p-4 text-slate-500">—</td>
                      </tr>
                      {expandedId === 'unassigned' && renderExpenseDetails(11)}
                    </>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900/80 font-semibold">
                    <td className="p-4 text-slate-200">Итого</td>
                    <td className="p-4 text-slate-300">{data.totals.rentCount}</td>
                    <td className="p-4 text-slate-300">{data.totals.rentDays}</td>
                    <td className="p-4 text-emerald-400">{formatMoney(data.totals.revenue)}</td>
                    <td className="p-4 text-rose-400">{formatMoney(data.totals.expenses + data.totals.unassignedExpenses)}</td>
                    <td className={`p-4 ${data.totals.profit - data.totals.unassignedExpenses >= 0 ? 'text-lime-400' : 'text-rose-400'}`}>
                      {formatMoney(data.totals.profit - data.totals.unassignedExpenses)}
                    </td>
                    <td className="p-4 text-slate-500">—</td>
                    <td className="p-4 text-slate-500">—</td>
                    <td className="p-4 text-slate-300">{formatMoney(data.totals.avgCheck)}</td>
                    <td className="p-4 text-slate-300">{data.totals.utilization}%</td>
                    <td className="p-4 text-slate-500">—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
