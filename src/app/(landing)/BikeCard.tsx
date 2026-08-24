'use client';
import React from 'react';
import Image from 'next/image';

interface BikeCardProps {
  bike: any;
  onBook: (bike: any) => void;
}

export default function BikeCard({ bike, onBook }: BikeCardProps) {
  // Безопасное извлечение и форматирование данных
  const bikeName = String(bike.name || 'Электровелосипед');
  const bikeVoltage = String(bike.voltage || '60V');
  const bikeBattery = String(bike.battery || '45 Ah');
  const bikePrice = String(bike.pricePerDay || '500');
  const bikeImage = bike.imageUrl || null;

  return (
    <div className="h-full bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-4 flex flex-col hover:border-emerald-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-emerald-500/5">
      {/* Область фото — фиксированная высота для всех карточек */}
      <div className="w-full h-44 bg-slate-950/80 rounded-2xl flex items-center justify-center relative overflow-hidden mb-4 border border-slate-800/50 group-hover:border-slate-700/50 transition-colors">
        {bikeImage ? (
          <Image
            src={bikeImage}
            alt={bikeName}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={bikeImage.startsWith('http')}
          />
        ) : (
          <span className="text-7xl group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 select-none">🚲</span>
        )}
      </div>

      {/* Контент карточки — flex для одинаковой высоты */}
      <div className="flex flex-col flex-1">
        {/* Название */}
        <h3 className="text-lg font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors mb-2">
          {bikeName}
        </h3>

        {/* Характеристики — 2 строки */}
        <div className="space-y-2 mb-4 text-sm font-mono">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500">Напряжение</span>
            <span className="text-slate-200 font-bold">{bikeVoltage}</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500">Ёмкость АКБ</span>
            <span className="text-slate-200 font-bold">{bikeBattery}</span>
          </div>
        </div>

        {/* Цена */}
        <div className="mt-auto">
          <p className="text-xs text-slate-500 uppercase font-black tracking-wider select-none">Стоимость</p>
          <p className="text-xl font-black text-white mt-0.5 tracking-tight">
            {bikePrice}
            <span className="text-sm text-slate-400 font-medium font-mono"> ₽ / сут</span>
          </p>
        </div>

        {/* Кнопка */}
        <button
          type="button"
          onClick={() => onBook(bike)}
          className="w-full mt-4 py-3.5 min-h-11 rounded-xl font-black text-sm transition-all active:scale-95 shadow-md bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 hover:shadow-lg hover:shadow-emerald-500/10 hover:from-emerald-400 hover:to-emerald-300 cursor-pointer"
        >
          Арендовать
        </button>
      </div>
    </div>
  );
}
