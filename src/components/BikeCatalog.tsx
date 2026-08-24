'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRentStore } from '@/store/useRentStore';
import { Bike } from '@/types';

export function BikeCatalog() {
  const { selectBike, toggleBookingModal } = useRentStore();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bikes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBikes(data);
      })
      .catch((err) => console.error('Ошибка загрузки байков:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (bike: Bike) => {
    selectBike(bike);
    toggleBookingModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-400 font-medium animate-pulse">
        Загрузка доступного автопарка из базы данных...
      </div>
    );
  }

  if (bikes.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400 border border-dashed border-slate-800 rounded-3xl max-w-xl mx-auto">
        В базе данных нет свободных велосипедов. Запустите сидинг!
      </div>
    );
  }

  return (
    <section className="px-4 py-16 bg-transparent relative z-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 mt-12 sm:grid-cols-2">
          {bikes.map((bike) => (
            <div key={bike.id} className="flex flex-col bg-slate-900/60 rounded-3xl overflow-hidden border border-slate-800/80 backdrop-blur-md shadow-xl hover:border-slate-700/60 transition-all duration-300">
              <div className="h-48 bg-slate-950/50 relative flex items-center justify-center text-slate-500 font-medium border-b border-slate-800/50 overflow-hidden">
                {bike.imageUrl ? (
                  <Image
                    src={bike.imageUrl}
                    alt={bike.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    unoptimized={bike.imageUrl.startsWith('http')}
                  />
                ) : (
                  <span className="z-10">📸 {bike.name}</span>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-slate-100">{bike.name}</h3>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850"><div className="text-xs text-slate-500 mb-1">Ход</div><div className="text-sm font-bold text-slate-300">{bike.range}</div></div>
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850"><div className="text-xs text-slate-500 mb-1">Скорость</div><div className="text-sm font-bold text-slate-300">{bike.speed}</div></div>
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850"><div className="text-xs text-slate-500 mb-1">Мотор</div><div className="text-sm font-bold text-slate-300">{bike.motor}</div></div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center flex-wrap gap-2">
                  <div><span className="text-xs text-slate-400">Тариф:</span><div className="text-lg font-bold text-yellow-400">от {bike.pricePerDay} ₽/день</div></div>
                  <button onClick={() => handleSelect(bike)} className="px-5 py-2.5 min-h-11 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-white font-medium rounded-xl text-sm transition-colors">Выбрать</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Двойная страховка экспорта для Next.js
export default BikeCatalog;
