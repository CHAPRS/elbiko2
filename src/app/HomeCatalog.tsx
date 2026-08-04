'use client';

import React, { useState, useEffect } from 'react';

// Строгий интерфейс для соответствия схеме СУБД
interface Bike {
  id: number;
  name: string;
  status: 'FREE' | 'RENTED' | 'MAINTENANCE';
  speed: string;
  range: string;
  motor: string;
  isWaterproof: boolean;
}

export default function HomeCatalog() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  useEffect(() => {
    fetch('/api/admin/bikes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBikes(data);
        }
      })
      .catch((err) => console.error('Ошибка СУБД:', err));
  }, []);

  // Безопасное поиндексное извлечение данных из MySQL с автоподстановкой MVP-заглушек
  const b1: Bike = (bikes && bikes.length > 0) 
    ? bikes[0] 
    : { id: 1, name: 'Monster Long Range PRO', speed: 'до 50 км/ч', range: 'до 80 км', motor: '500W', isWaterproof: true, status: 'FREE' };

  const b2: Bike = (bikes && bikes.length > 1) 
    ? bikes[1] 
    : { id: 2, name: 'Monster Heavy Duty', speed: 'до 45 км/ч', range: 'до 70 км', motor: '450W', isWaterproof: true, status: 'FREE' };

  const b3: Bike = (bikes && bikes.length > 2) 
    ? bikes[2] 
    : { id: 3, name: 'Monster Eco Delivery', speed: 'до 40 км/ч', range: 'до 60 км', motor: '350W', isWaterproof: false, status: 'FREE' };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanName = String(clientName).trim();
    const cleanPhone = String(clientPhone).trim();
    const cleanBikeName = String(selectedBike?.name || 'Электровелосипед').trim();

        try {
      // ИСПРАВЛЕНО: Стучимся на новый чистый адрес роута
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          bikeName: cleanBikeName
        }),
      });

      if (res.ok) {
        alert('🎉 Спасибо! Ваша заявка успешно отправлена менеджерам Elbiko.');
      } else {
        alert('⚠️ Произошла ошибка при отправке заявки.');
      }
    } catch (err) {
      console.error('Ошибка отправки:', err);
    }

    
    setClientName('');
    setClientPhone('');
    setIsModalOpen(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Карточка 1 */}
      <div className="border border-slate-800 bg-slate-900/40 p-6 rounded-2xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-100">{b1.name}</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">{b1.status}</span>
        </div>
        <div className="space-y-1 text-sm text-slate-400 mb-6">
          <div>🚀 Скорость: {b1.speed}</div>
          <div>🔋 Запас: {b1.range}</div>
          <div>⚡ Мотор: {b1.motor}</div>
          <div className="text-cyan-400 pt-1">
            {b1.isWaterproof ? '☔ Полная аквазащита' : 'Базовая влагозащита'}
          </div>
        </div>
        <button onClick={() => { setSelectedBike(b1); setIsModalOpen(true); }} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold">
          Забронировать
        </button>
      </div>

      {/* Карточка 2 */}
      <div className="border border-slate-800 bg-slate-900/40 p-6 rounded-2xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-100">{b2.name}</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">{b2.status}</span>
        </div>
        <div className="space-y-1 text-sm text-slate-400 mb-6">
          <div>🚀 Скорость: {b2.speed}</div>
          <div>🔋 Запас: {b2.range}</div>
          <div>⚡ Мотор: {b2.motor}</div>
          <div className="text-cyan-400 pt-1">
            {b2.isWaterproof ? '☔ Полная аквазащита' : 'Базовая влагозащита'}
          </div>
        </div>
        <button onClick={() => { setSelectedBike(b2); setIsModalOpen(true); }} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold">
          Забронировать
        </button>
      </div>

      {/* Карточка 3 */}
      <div className="border border-slate-800 bg-slate-900/40 p-6 rounded-2xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-100">{b3.name}</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">{b3.status}</span>
        </div>
        <div className="space-y-1 text-sm text-slate-400 mb-6">
          <div>🚀 Скорость: {b3.speed}</div>
          <div>🔋 Запас: {b3.range}</div>
          <div>⚡ Мотор: {b3.motor}</div>
          <div className="text-cyan-400 pt-1">
            {b3.isWaterproof ? '☔ Полная аквазащита' : 'Базовая влагозащита'}
          </div>
        </div>
        <button onClick={() => { setSelectedBike(b3); setIsModalOpen(true); }} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold">
          Забронировать
        </button>
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Бронирование {selectedBike?.name}</h3>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Имя" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white" />
              <input type="tel" required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Telephone" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white" />
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 py-2.5 rounded-xl border border-slate-800 text-slate-400">Отмена</button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold">Отправить заказ</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
