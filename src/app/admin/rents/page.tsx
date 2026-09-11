'use client';

import React, { useState, useEffect } from 'react';

interface Rent {
  id: number;
  startDate: string;
  endDate: string;
  actualReturnDate?: string | null;
  totalPrice: number;
  isActive: boolean;
  status: string;
  comment?: string | null;
  user: {
    id: number;
    name: string;
    phone: string;
  };
  bike: {
    id: number;
    name: string;
    externalId?: string | null;
    status: string;
  };
  payment?: {
    id: number;
    amount: number;
    status: string;
    paymentMethod?: string | null;
    paidAt?: string | null;
  };
}

export default function RentsPage() {
  const [rents, setRents] = useState<Rent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [extendDays, setExtendDays] = useState<Record<number, number>>({});
  const [paymentMethods, setPaymentMethods] = useState<Record<number, string>>({});

  const [editingRent, setEditingRent] = useState<Rent | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editComment, setEditComment] = useState('');

  const toInputDate = (dateString: string) => {
    const d = new Date(dateString);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  const fetchRents = async () => {
    try {
      const url = filter === 'ALL' 
        ? '/api/admin/rents' 
        : `/api/admin/rents?status=${filter}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRents(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки аренд:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRents();
  }, [filter]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/rents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchRents();
      }
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
    }
  };

  const handleExtend = async (id: number) => {
    const days = extendDays[id];
    if (!days || days <= 0) return;

    try {
      const res = await fetch(`/api/admin/rents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extendDays: days }),
      });

      if (res.ok) {
        setExtendDays({ ...extendDays, [id]: 0 });
        fetchRents();
      }
    } catch (err) {
      console.error('Ошибка при продлении аренды:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить аренду?')) return;

    try {
      const res = await fetch(`/api/admin/rents/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchRents();
      }
    } catch (err) {
      console.error('Ошибка при удалении аренды:', err);
    }
  };

  const handleReturn = async (id: number) => {
    if (!confirm('Отметить возврат велосипеда? Байк станет доступен.')) return;

    try {
      const res = await fetch(`/api/admin/rents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RETURNED' }),
      });

      if (res.ok) {
        fetchRents();
      }
    } catch (err) {
      console.error('Ошибка при возврате:', err);
    }
  };

  const handleEdit = (rent: Rent) => {
    setEditingRent(rent);
    setEditStart(toInputDate(rent.startDate));
    setEditEnd(toInputDate(rent.endDate));
    setEditPrice(String(rent.totalPrice));
    setEditComment(rent.comment || '');
  };

  const handleSaveEdit = async () => {
    if (!editingRent) return;

    try {
      const res = await fetch(`/api/admin/rents/${editingRent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: editStart,
          endDate: editEnd,
          totalPrice: Number(editPrice),
          comment: editComment,
        }),
      });

      if (res.ok) {
        setEditingRent(null);
        fetchRents();
      } else {
        const data = await res.json();
        console.error('Ошибка сохранения аренды:', data.error);
      }
    } catch (err) {
      console.error('Ошибка связи при сохранении аренды:', err);
    }
  };

  const handlePayment = async (id: number, method: string) => {
    try {
      const res = await fetch(`/api/admin/rents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'COMPLETED', paymentMethod: method }),
      });

      if (res.ok) {
        fetchRents();
      }
    } catch (err) {
      console.error('Ошибка при обновлении платежа:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      ACTIVE: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
      RETURNED: 'bg-amber-950 text-amber-400 border border-amber-800',
      COMPLETED: 'bg-blue-950 text-blue-400 border border-blue-800',
      CANCELLED: 'bg-slate-950 text-slate-400 border border-slate-800',
      OVERDUE: 'bg-rose-950 text-rose-400 border border-rose-800',
    };
    return badges[status] || 'bg-slate-950 text-slate-400 border border-slate-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Активна',
      RETURNED: 'Возвращена',
      COMPLETED: 'Завершена',
      CANCELLED: 'Отменена',
      OVERDUE: 'Просрочена',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isOverdue = (endDate: string, status: string) => {
    if (status !== 'ACTIVE') return false;
    return new Date(endDate) < new Date();
  };

  // Генерация строк таблицы
  const rentRows: React.ReactElement[] = [];

  if (isLoading) {
    rentRows.push(
      <tr key="loading" className="border-b border-slate-800">
        <td colSpan={9} className="p-4 text-center text-slate-400">Загрузка данных...</td>
      </tr>
    );
  } else if (rents.length === 0) {
    rentRows.push(
      <tr key="empty" className="border-b border-slate-800">
        <td colSpan={9} className="p-4 text-center text-slate-400">Аренды не найдены</td>
      </tr>
    );
  } else {
    rents.forEach((rent) => {
      const overdue = isOverdue(rent.endDate, rent.status);
      
      rentRows.push(
        <tr key={rent.id} className={`border-b border-slate-800 hover:bg-slate-900/50 transition-colors ${overdue ? 'bg-rose-950/20' : ''}`}>
          <td className="p-4 font-medium text-white">{rent.id}</td>
          <td className="p-4 text-white">{rent.user.name}</td>
          <td className="p-4 text-slate-300">{rent.user.phone}</td>
          <td className="p-4 text-slate-300">
            {rent.bike.name}{rent.bike.externalId ? ` (ID: ${rent.bike.externalId})` : ''}
          </td>
          <td className="p-4 text-slate-300">{formatDate(rent.startDate)}</td>
          <td className="p-4 text-slate-300">{formatDate(rent.endDate)}</td>
          <td className="p-4 text-emerald-400 font-medium">{rent.totalPrice.toLocaleString()} ₽</td>
          <td className="p-4 text-sm">
            <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(rent.status)}`}>
              {getStatusLabel(rent.status)}
            </span>
            {overdue && <span className="ml-2 text-xs text-rose-400">(Просрочена)</span>}
          </td>
          <td className="p-4 text-right space-x-1">
            <button
              onClick={() => handleEdit(rent)}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition-colors"
            >
              Ред.
            </button>
            <select
              value={rent.status}
              onChange={(e) => handleStatusChange(rent.id, e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="ACTIVE">Активна</option>
              <option value="RETURNED">Возвращена</option>
              <option value="COMPLETED">Завершена</option>
              <option value="CANCELLED">Отменена</option>
              <option value="OVERDUE">Просрочена</option>
            </select>
            {rent.payment && rent.payment.status !== 'COMPLETED' && (
              <>
                <select
                  value={paymentMethods[rent.id] || 'CASH'}
                  onChange={(e) => setPaymentMethods({ ...paymentMethods, [rent.id]: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="CASH">Наличные</option>
                  <option value="SBP">СБП</option>
                  <option value="CARD">Карта</option>
                  <option value="TRANSFER">Перевод</option>
                </select>
                <button
                  onClick={() => handlePayment(rent.id, paymentMethods[rent.id] || 'CASH')}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs transition-colors"
                >
                  Оплатить
                </button>
              </>
            )}
            {rent.status === 'ACTIVE' && (
              <button
                onClick={() => handleReturn(rent.id)}
                className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs transition-colors"
              >
                Вернуть
              </button>
            )}
            <button
              onClick={() => handleDelete(rent.id)}
              className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs transition-colors"
            >
              Удалить
            </button>
          </td>
        </tr>
      );
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-8">
          Управление арендами
        </h1>

        {/* Фильтры */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'ACTIVE'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Активные
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'COMPLETED'
                ? 'bg-blue-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Завершенные
          </button>
          <button
            onClick={() => setFilter('OVERDUE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'OVERDUE'
                ? 'bg-rose-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Просроченные
          </button>
        </div>

        {/* Таблица аренд */}
        <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Клиент</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Телефон</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Велосипед</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Начало</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Окончание</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Стоимость</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Статус</th>
                <th className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody>
              {rentRows}
            </tbody>
          </table>
        </div>

        {/* Модал редактирования аренды */}
        {editingRent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
              <h2 className="mb-4 text-lg font-semibold text-slate-100">
                Редактирование аренды #{editingRent.id}
              </h2>
              <p className="mb-4 text-sm text-slate-400">
                {editingRent.user.name} · {editingRent.user.phone}
                <br />
                {editingRent.bike.name}{editingRent.bike.externalId ? ` (ID: ${editingRent.bike.externalId})` : ''}
              </p>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Начало</label>
                  <input
                    type="date"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Окончание</label>
                  <input
                    type="date"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-slate-400">Стоимость, ₽</label>
                <input
                  type="number"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-slate-400">Комментарий</label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingRent(null)}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-500 transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Статистика */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-emerald-400">{rents.filter(r => r.status === 'ACTIVE').length}</div>
            <div className="text-xs text-slate-400">Активных</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-blue-400">{rents.filter(r => r.status === 'COMPLETED').length}</div>
            <div className="text-xs text-slate-400">Завершено</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-rose-400">{rents.filter(r => r.status === 'OVERDUE').length}</div>
            <div className="text-xs text-slate-400">Просрочено</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-slate-400">{rents.length}</div>
            <div className="text-xs text-slate-400">Всего</div>
          </div>
        </div>
      </div>
    </div>
  );
}