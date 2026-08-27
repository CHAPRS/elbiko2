'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BIKE_STATUSES, BIKE_STATUS_LABELS, BikeStatus } from '@/lib/bikeStatus';

interface Bike {
  id: number;
  name: string;
  status: BikeStatus;
  speed: string;
  range: string;
  motor: string;
  isWaterproof: boolean;
  pricePerDay: string | number;
  imageUrl: string | null;
  _count?: { rents: number };
}

interface BikeForm {
  name: string;
  speed: string;
  range: string;
  motor: string;
  pricePerDay: string;
  imageUrl: string;
  isWaterproof: boolean;
}

const EMPTY_FORM: BikeForm = {
  name: '',
  speed: '',
  range: '',
  motor: '',
  pricePerDay: '500',
  imageUrl: '',
  isWaterproof: false,
};

const STATUS_BADGE: Record<BikeStatus, string> = {
  FREE: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  RENTED: 'bg-amber-950 text-amber-400 border-amber-800',
  MAINTENANCE: 'bg-rose-950 text-rose-400 border-rose-800',
};

export default function AdminPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<BikeForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchBikes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/bikes');
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Не удалось загрузить автопарк');
        return;
      }

      setBikes(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Нет связи с сервером');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBikes();
  }, [fetchBikes]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.speed || !form.range || !form.motor) {
      setError('Заполните название, скорость, запас хода и мотор');
      return;
    }

    setIsSaving(true);

    const payload = {
      ...form,
      pricePerDay: Number(form.pricePerDay),
      imageUrl: form.imageUrl || null,
      ...(editingId ? { id: editingId } : {}),
    };

    try {
      const res = await fetch('/api/admin/bikes', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Не удалось сохранить велосипед');
        return;
      }

      resetForm();
      setError(null);
      fetchBikes();
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      setError('Нет связи с сервером');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (bike: Bike) => {
    setEditingId(bike.id);
    setForm({
      name: bike.name,
      speed: bike.speed,
      range: bike.range,
      motor: bike.motor,
      pricePerDay: String(bike.pricePerDay),
      imageUrl: bike.imageUrl || '',
      isWaterproof: bike.isWaterproof,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStatus = async (id: number, status: BikeStatus) => {
    try {
      const res = await fetch('/api/admin/bikes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Не удалось обновить статус');
        return;
      }

      setError(null);
      fetchBikes();
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
      setError('Нет связи с сервером');
    }
  };

  const handleDeleteBike = async (id: number) => {
    if (!confirm('Удалить велосипед?')) return;

    try {
      const res = await fetch(`/api/admin/bikes?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Не удалось удалить велосипед');
        return;
      }

      if (editingId === id) resetForm();
      setError(null);
      fetchBikes();
    } catch (err) {
      console.error('Ошибка при удалении:', err);
      setError('Нет связи с сервером');
    }
  };

  const stats = BIKE_STATUSES.map((status) => ({
    status,
    count: bikes.filter((bike) => bike.status === status).length,
  }));

  const bikeRows: React.ReactElement[] = [];

  if (isLoading) {
    bikeRows.push(
      <tr key="loading" className="border-b border-slate-800">
        <td colSpan={5} className="p-4 text-center text-slate-400">Загрузка данных...</td>
      </tr>
    );
  } else if (bikes.length === 0) {
    bikeRows.push(
      <tr key="empty" className="border-b border-slate-800">
        <td colSpan={5} className="p-4 text-center text-slate-400">Велосипеды не найдены</td>
      </tr>
    );
  } else {
    bikes.forEach((bike) => {
      const specsText = `Скорость: ${bike.speed} | Запас: ${bike.range} | Мотор: ${bike.motor}${bike.isWaterproof ? ' | ☔ Аквазащита' : ''}`;
      const badgeClass = `px-2 py-1 rounded text-xs border ${STATUS_BADGE[bike.status] ?? 'bg-slate-800 text-slate-300 border-slate-700'}`;

      bikeRows.push(
        <tr key={bike.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors align-top">
          <td className="p-4 font-medium text-white">{bike.name}</td>
          <td className="p-4 text-slate-300 text-sm">{specsText}</td>
          <td className="p-4 text-slate-200 text-sm whitespace-nowrap">{Number(bike.pricePerDay)} ₽/сут</td>
          <td className="p-4 text-sm font-semibold whitespace-nowrap">
            <span className={badgeClass}>{BIKE_STATUS_LABELS[bike.status] ?? bike.status}</span>
          </td>
          <td className="p-4 text-right space-x-2 space-y-1 whitespace-nowrap">
            <button
              onClick={() => handleEdit(bike)}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition-colors"
            >
              Изменить
            </button>
            {bike.status !== 'FREE' && (
              <button
                onClick={() => handleUpdateStatus(bike.id, 'FREE')}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs transition-colors"
              >
                Освободить
              </button>
            )}
            {bike.status !== 'MAINTENANCE' && (
              <button
                onClick={() => handleUpdateStatus(bike.id, 'MAINTENANCE')}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs transition-colors"
              >
                Сервис
              </button>
            )}
            <button
              onClick={() => handleDeleteBike(bike.id)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-900 rounded text-xs transition-colors"
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-8">
          Панель администратора Elbiko
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400">Всего в парке</div>
            <div className="text-2xl font-bold text-white">{bikes.length}</div>
          </div>
          {stats.map(({ status, count }) => (
            <div key={status} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400">{BIKE_STATUS_LABELS[status]}</div>
              <div className="text-2xl font-bold text-white">{count}</div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-md p-6 rounded-xl h-fit">
            <h2 className="text-xl font-semibold text-amber-500 mb-4">
              {editingId ? `Редактирование #${editingId}` : 'Добавить электровелосипед'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Название модели</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Например, Monster Long Range"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Максимальная скорость</label>
                <input
                  type="text"
                  value={form.speed}
                  onChange={(e) => setForm({ ...form, speed: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Например, до 50 км/ч"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Запас хода</label>
                <input
                  type="text"
                  value={form.range}
                  onChange={(e) => setForm({ ...form, range: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Например, до 80 км"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Мощность мотора</label>
                <input
                  type="text"
                  value={form.motor}
                  onChange={(e) => setForm({ ...form, motor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Например, 500W"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Цена аренды, ₽/сутки</label>
                <input
                  type="number"
                  min="1"
                  value={form.pricePerDay}
                  onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Ссылка на фото (необязательно)</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="waterproof"
                  checked={form.isWaterproof}
                  onChange={(e) => setForm({ ...form, isWaterproof: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="waterproof" className="text-sm font-medium text-slate-300 cursor-pointer">
                  Полная гидроизоляция (Аквазащита)
                </label>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-bold py-2.5 px-4 rounded-lg mt-4 transition-all"
              >
                {editingId ? 'Сохранить изменения' : 'Создать и сохранить'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Отменить редактирование
                </button>
              )}
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 backdrop-blur-md p-6 rounded-xl overflow-x-auto">
            <h2 className="text-xl font-semibold text-amber-500 mb-4">Управление автопарком</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4">Модель</th>
                  <th className="p-4">Характеристики</th>
                  <th className="p-4">Тариф</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {bikeRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
