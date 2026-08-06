'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Bike {
  id: number;
  name: string;
  status: 'FREE' | 'RENTED' | 'MAINTENANCE';
  speed: string;
  range: string;
  motor: string;
  isWaterproof: boolean;
}

export default function AdminPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState('');
  const [speed, setSpeed] = useState('');
  const [range, setRange] = useState('');
  const [motor, setMotor] = useState('');
  const [isWaterproof, setIsWaterproof] = useState(false);

  const fetchBikes = async () => {
    try {
      const res = await fetch('/api/admin/bikes');
      if (res.ok) {
        const data = await res.json();
        setBikes(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  const handleCreateBike = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !speed || !range || !motor) return;

    try {
      const res = await fetch('/api/admin/bikes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, speed, range, motor, isWaterproof }),
      });

      if (res.ok) {
        setName('');
        setSpeed('');
        setRange('');
        setMotor('');
        setIsWaterproof(false);
        fetchBikes();
      }
    } catch (err) {
      console.error('Ошибка при создании:', err);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: Bike['status']) => {
    try {
      const res = await fetch('/api/admin/bikes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        fetchBikes();
      }
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
    }
  };

  const handleDeleteBike = async (id: number) => {
    if (!confirm('Удалить велосипед?')) return;

    try {
      const res = await fetch(`/api/admin/bikes?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchBikes();
      }
    } catch (err) {
      console.error('Ошибка при удалении:', err);
    }
  };

  // =========================================================================
  // ПРИНЦИП ИЗОЛИРОВАННОГО ПЛОСКОГО JSX (Изолированные переменные выше return)
  // =========================================================================
  const bikeRows: React.ReactElement[] = [];

  if (isLoading) {
    bikeRows.push(
      <tr key="loading" className="border-b border-slate-800">
        <td colSpan={4} className="p-4 text-center text-slate-400">Загрузка данных...</td>
      </tr>
    );
  } else if (bikes.length === 0) {
    bikeRows.push(
      <tr key="empty" className="border-b border-slate-800">
        <td colSpan={4} className="p-4 text-center text-slate-400">Велосипеды не найдены</td>
      </tr>
    );
  } else {
    bikes.forEach((bike) => {
      // Генерация плоского текста характеристик
      const specsText = `Скорость: ${bike.speed} | Запас: ${bike.range} | Мотор: ${bike.motor} ${bike.isWaterproof ? '☔ (Аквазащита)' : ''}`;

      // Определение стилей для бейджа статуса
      let badgeClass = 'px-2 py-1 rounded text-xs ';
      if (bike.status === 'FREE') badgeClass += 'bg-emerald-950 text-emerald-400 border border-emerald-800';
      if (bike.status === 'RENTED') badgeClass += 'bg-amber-950 text-amber-400 border border-amber-800';
      if (bike.status === 'MAINTENANCE') badgeClass += 'bg-rose-950 text-rose-400 border border-rose-800';

      // Пушим готовую изолированную строку 
      bikeRows.push(
        <tr key={bike.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
          <td className="p-4 font-medium text-white">{bike.name}</td>
          <td className="p-4 text-slate-300 text-sm">{specsText}</td>
          <td className="p-4 text-sm font-semibold">
            <span className={badgeClass}>{bike.status}</span>
          </td>
          <td className="p-4 text-right space-x-2">
            {bike.status !== 'FREE' && (
              <button
                onClick={() => handleUpdateStatus(bike.id, 'FREE')}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs transition-colors"
              >
                Освободить
              </button>
            )}
            {bike.status !== 'RENTED' && (
              <button
                onClick={() => handleUpdateStatus(bike.id, 'RENTED')}
                className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs transition-colors"
              >
                В аренду
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
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition-colors"
            >
              Удалить
            </button>
          </td>
        </tr>
      );
    });
  }

  // Абсолютно чистый return без вложенной логики, итераторов и условий
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-8">
          Панель администратора Elbiko
        </h1>

        {/* Навигация */}
        <div className="mb-8 flex gap-4">
          <Link
            href="/admin"
            className="px-4 py-2 bg-amber-500 text-slate-950 rounded-lg font-medium hover:bg-amber-400 transition-colors"
          >
            🚲 Велосипеды
          </Link>
          <Link
            href="/admin/leads"
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
          >
            📋 Заявки
          </Link>
          <Link
            href="/admin/rents"
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
          >
            📊 Аренды
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-md p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-amber-500 mb-4">Добавить электровелосипед</h2>
            <form onSubmit={handleCreateBike} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Название модели</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Например, Monster Long Range"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Максимальная скорость</label>
                <input
                  type="text"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Например, до 50 км/ч"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Запас хода</label>
                <input
                  type="text"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Например, до 80 км"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Мощность мотора</label>
                <input
                  type="text"
                  value={motor}
                  onChange={(e) => setMotor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Например, 500W"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="waterproof"
                  checked={isWaterproof}
                  onChange={(e) => setIsWaterproof(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="waterproof" className="text-sm font-medium text-slate-300 cursor-pointer">
                  Полная гидроизоляция (Аквазащита)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold py-2.5 px-4 rounded-lg mt-4 transition-all"
              >
                Создать и сохранить
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 backdrop-blur-md p-6 rounded-xl overflow-x-auto">
            <h2 className="text-xl font-semibold text-amber-500 mb-4">Управление автопарком</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4">Модель</th>
                  <th className="p-4">Характеристики</th>
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
