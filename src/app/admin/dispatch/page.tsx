'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalBikes: number;
  rentedBikes: number;
  freeBikes: number;
  maintenanceBikes: number;
  totalUsers: number;
  newLeads: number;
  activeRents: number;
  overdueRents: number;
}

interface Bike {
  id: number;
  name: string;
  status: string;
  pricePerDay: number;
}

interface Lead {
  id: number;
  name: string;
  phone: string;
  bikeName?: string | null;
  createdAt: string;
  bike?: { id: number; name: string } | null;
}

interface RentUser {
  id: number;
  name: string;
  phone: string;
}

interface RentBike {
  id: number;
  name: string;
  status: string;
}

interface Rent {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  user: RentUser;
  bike: RentBike;
}

interface DashboardData {
  stats: Stats;
  newLeads: Lead[];
  activeRents: Rent[];
  overdueRents: Rent[];
  freeBikes: Bike[];
  maintenanceBikes: Bike[];
}

const STATUS_COLORS: Record<string, string> = {
  FREE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  RENTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  MAINTENANCE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DispatchPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Не удалось загрузить дашборд');
        return;
      }
      setData(json);
      setError(null);
    } catch (err) {
      setError('Нет связи с сервером');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const takeLead = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });
      if (res.ok) {
        setNotice('Заявка взята в работу');
        fetchDashboard();
      } else {
        const json = await res.json();
        setError(json.error || 'Не удалось обновить заявку');
      }
    } catch {
      setError('Нет связи с сервером');
    }
  };

  const completeRent = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/rents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (res.ok) {
        setNotice('Аренда завершена, байк освобожден');
        fetchDashboard();
      } else {
        const json = await res.json();
        setError(json.error || 'Не удалось завершить аренду');
      }
    } catch {
      setError('Нет связи с сервером');
    }
  };

  const extendRent = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/rents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extendDays: 1 }),
      });
      if (res.ok) {
        setNotice('Аренда продлена на 1 день');
        fetchDashboard();
      } else {
        const json = await res.json();
        setError(json.error || 'Не удалось продлить аренду');
      }
    } catch {
      setError('Нет связи с сервером');
    }
  };

  const stats: { label: string; value: number; color: string }[] = data
    ? [
        { label: 'Новые заявки', value: data.stats.newLeads, color: 'text-emerald-400' },
        { label: 'Активные аренды', value: data.stats.activeRents, color: 'text-amber-400' },
        { label: 'Просроченные', value: data.stats.overdueRents, color: 'text-rose-400' },
        { label: 'Свободные байки', value: data.stats.freeBikes, color: 'text-cyan-400' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-8">
          Диспетчерская
        </h1>

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-pulse h-24"
                />
              ))
            : stats.map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-4"
                >
                  <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{item.label}</div>
                </div>
              ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200">
                Новые заявки
              </h2>
              <Link
                href="/admin/leads"
                className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
              >
                Все заявки
              </Link>
            </div>

            {loading ? (
              <p className="text-slate-400 text-sm">Загрузка...</p>
            ) : data && data.newLeads.length === 0 ? (
              <p className="text-slate-400 text-sm">Новых заявок нет</p>
            ) : (
              <ul className="space-y-3">
                {data?.newLeads.map((lead) => (
                  <li
                    key={lead.id}
                    className="border border-slate-800 rounded-lg p-3 bg-slate-950/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-100">{lead.name}</p>
                        <p className="text-sm text-slate-400">{lead.phone}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {lead.bike?.name || lead.bikeName || 'Байк не выбран'} · {formatDateTime(lead.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => takeLead(lead.id)}
                          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs transition-colors"
                        >
                          В работу
                        </button>
                        <Link
                          href="/admin/leads"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                        >
                          Открыть
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200">
                Активные и просроченные аренды
              </h2>
              <Link
                href="/admin/rents"
                className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
              >
                Все аренды
              </Link>
            </div>

            {loading ? (
              <p className="text-slate-400 text-sm">Загрузка...</p>
            ) : data && data.activeRents.length === 0 ? (
              <p className="text-slate-400 text-sm">Активных аренд нет</p>
            ) : (
              <ul className="space-y-3">
                {data?.activeRents.map((rent) => {
                  const overdue = new Date(rent.endDate) < new Date();
                  return (
                    <li
                      key={rent.id}
                      className={`border rounded-lg p-3 ${
                        overdue
                          ? 'bg-rose-950/20 border-rose-900'
                          : 'bg-slate-950/50 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-100">{rent.user.name}</p>
                          <p className="text-sm text-slate-400">{rent.user.phone}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {rent.bike.name} · до {formatDate(rent.endDate)}
                            {overdue && (
                              <span className="ml-2 text-rose-400 font-medium">(просрочена)</span>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                          <button
                            onClick={() => completeRent(rent.id)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs transition-colors"
                          >
                            Завершить
                          </button>
                          <button
                            onClick={() => extendRent(rent.id)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                          >
                            +1 день
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">
              Свободный транспорт
            </h2>
            {loading ? (
              <p className="text-slate-400 text-sm">Загрузка...</p>
            ) : data && data.freeBikes.length === 0 ? (
              <p className="text-slate-400 text-sm">Нет свободных байков</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data?.freeBikes.map((bike) => (
                  <li
                    key={bike.id}
                    className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 text-sm"
                  >
                    <p className="font-medium text-slate-100">{bike.name}</p>
                    <p className="text-slate-400">{Number(bike.pricePerDay)} ₽/сут</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">
              На сервисе
            </h2>
            {loading ? (
              <p className="text-slate-400 text-sm">Загрузка...</p>
            ) : data && data.maintenanceBikes.length === 0 ? (
              <p className="text-slate-400 text-sm">Нет байков на сервисе</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data?.maintenanceBikes.map((bike) => (
                  <li
                    key={bike.id}
                    className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 text-sm"
                  >
                    <p className="font-medium text-slate-100">{bike.name}</p>
                    <p className="text-slate-400">{Number(bike.pricePerDay)} ₽/сут</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
