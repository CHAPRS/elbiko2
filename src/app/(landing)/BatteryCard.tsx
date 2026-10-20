'use client';
import React, { useState } from 'react';
import { normalizeImageUrl } from '@/lib/image';

interface BatteryCardProps {
  battery: any;
  onBook: (battery: any) => void;
}

export default function BatteryCard({ battery, onBook }: BatteryCardProps) {
  const [imgError, setImgError] = useState(false);
  const name = String(battery.name || 'Аккумулятор');
  const voltage = battery.voltage ? `${battery.voltage} В` : '—';
  const capacity = battery.capacityAh ? `${battery.capacityAh} Ah` : '—';
  const priceWeek = battery.pricePerWeek
    ? Number(battery.pricePerWeek).toLocaleString('ru-RU')
    : '1 500';
  const image = normalizeImageUrl(battery.imageUrl);

  return (
    <div className="w-full bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="aspect-[4/3] md:aspect-auto md:min-h-[16rem] bg-slate-950/80 flex items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/50">
          {image && !imgError ? (
            <img
              src={encodeURI(image)}
              alt={name}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-8xl group-hover:scale-105 group-hover:rotate-6 transition-transform duration-500 select-none">🔋</span>
          )}
        </div>

        <div className="p-6 sm:p-8 flex flex-col">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors mb-3">
            {name}
          </h3>

          <div className="space-y-2 mb-6 text-sm font-mono">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500">Напряжение</span>
              <span className="text-slate-200 font-bold">{voltage}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500">Ёмкость</span>
              <span className="text-slate-200 font-bold">{capacity}</span>
            </div>
          </div>

          <div className="mt-auto">
            <p className="text-xs text-slate-500 uppercase font-black tracking-wider select-none">Стоимость аренды</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-0.5 tracking-tight">
              от {priceWeek}
              <span className="text-base text-slate-400 font-medium font-mono"> ₽ / неделя</span>
            </p>
            <button
              type="button"
              onClick={() => onBook(battery)}
              className="w-full mt-4 py-3.5 min-h-11 rounded-xl font-black text-sm transition-all active:scale-95 shadow-md bg-gradient-to-r from-indigo-500 to-indigo-400 text-slate-950 hover:shadow-lg hover:shadow-indigo-500/10 hover:from-indigo-400 hover:to-indigo-300 cursor-pointer"
            >
              Арендовать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
