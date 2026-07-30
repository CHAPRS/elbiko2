'use client';
import React, { useEffect, useState } from 'react';
import BikeRow from './BikeRow';
import RentCard from './RentCard';

export default function AdminPage() {
  const [bikes, setBikes] = useState<any[]>([]);
  const [rents, setRents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalBikes: 0,
    rentedBikes: 0,
    freeBikes: 0,
    totalUsers: 0,
    usersWithTg: 0
  });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    power: '500W',
    maxSpeed: '45 км/ч',
    batteryLife: 'до 60 км',
    pricePerDay: '500'
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      if (data && !data.error) {
        if (Array.isArray(data.bikes)) setBikes(data.bikes);
        if (Array.isArray(data.rents)) setRents(data.rents);
        if (data.stats) setStats(data.stats);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateBike = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/bikes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          model: formData.model,
          power: formData.power,
          maxSpeed: formData.maxSpeed,
          batteryLife: formData.batteryLife,
          pricePerDay: Number(formData.pricePerDay)
        })
      });

      if (response.ok) {
        alert('Велосипед добавлен!');
        setFormData({ name: '', model: '', power: '500W', maxSpeed: '45 км/ч', batteryLife: 'до 60 км', pricePerDay: '500' });
        fetchDashboardData();
      } else {
        alert('Ошибка бэкенда');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (bikeId: number, currentStatus: string) => {
    if (currentStatus === 'RENTED') {
      alert('Нельзя изменить статус велосипеда, пока он находится в аренде у курьера.');
      return;
    }

    const nextStatus = currentStatus === 'FREE' ? 'MAINTENANCE' : 'FREE';

    try {
      setUpdatingId(bikeId);
      const res = await fetch('/api/admin/bikes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bikeId: bikeId, status: nextStatus })
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        alert('Не удалось обновить статус на сервере');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Шапка */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white">Панель управления Elbiko</h1>
            <p className="text-sm text-slate-400 mt-1">Менеджмент автопарка и мониторинг активных сессий</p>
          </div>
          <div className="text-xs bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-lg border border-yellow-500/20 font-mono">
            Режим: Administrator
          </div>
        </div>

        {/* Счётчики KPI */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Всего байков</p>
            <p className="text-2xl font-black mt-1 text-white">{stats.totalBikes}</p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
            <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Свободно</p>
            <p className="text-2xl font-black mt-1 text-green-400">{stats.freeBikes}</p>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">В аренде</p>
            <p className="text-2xl font-black mt-1 text-blue-400">{stats.rentedBikes}</p>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Курьеры в БД</p>
            <p className="text-2xl font-black mt-1 text-white">{stats.totalUsers}</p>
          </div>
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
            <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">В Telegram</p>
            <p className="text-2xl font-black mt-1 text-cyan-400">{stats.usersWithTg}</p>
          </div>
        </div>

        {/* Форма добавления */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">
            Добавить новый электровелосипед
          </h2>
          <form onSubmit={handleCreateBike} className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <input
              type="text" placeholder="Название" required
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
            />
            <input
              type="text" placeholder="Модель" required
              value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })}
              className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
            />
            <input
              type="text" placeholder="Мотор" required
              value={formData.power} onChange={e => setFormData({ ...formData, power: e.target.value })}
              className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
            />
            <input
              type="text" placeholder="Макс. скорость" required
              value={formData.maxSpeed} onChange={e => setFormData({ ...formData, maxSpeed: e.target.value })}
              className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
            />
            <input
              type="text" placeholder="Запас хода" required
              value={formData.batteryLife} onChange={e => setFormData({ ...formData, batteryLife: e.target.value })}
              className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
            />
            <input
              type="number" placeholder="Цена за день" required
              value={formData.pricePerDay} onChange={e => setFormData({ ...formData, pricePerDay: e.target.value })}
              className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
            />
            <button type="submit" className="sm:col-span-2 md:col-span-3 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black rounded-xl text-center text-sm shadow-lg">
              Внести велосипед в реестр базы данных
            </button>
          </form>
        </section>

        {/* Сетка модулей */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Текущий статус автопарка</h2>
            <div className="space-y-3">
              {loading && <p className="text-sm text-slate-500 font-mono">Загрузка автопарка...</p>}
              {!loading && bikes.length === 0 && <p className="text-sm text-slate-500 font-mono">Парк пуст.</p>}
              {!loading && bikes.map((bike) => (
                <BikeRow 
                  key={bike.id} 
                  bike={bike} 
                  updatingId={updatingId} 
                  onToggleStatus={handleToggleStatus} 
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Активные курьеры</h2>
            <div className="space-y-3">
              {loading && <p className="text-sm text-slate-500 font-mono">Синхронизация сессий...</p>}
              {!loading && rents.length === 0 && <p className="text-sm text-slate-500 font-mono">Нет активных аренд.</p>}
              {!loading && rents.map((rent) => (
                <RentCard key={rent.id} rent={rent} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
