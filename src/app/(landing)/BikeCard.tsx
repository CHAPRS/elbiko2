'use client';
import React from 'react';

interface BikeCardProps {
  bike: any;
  onBook: (bike: any) => void;
}

export default function BikeCard({ bike, onBook }: BikeCardProps) {
  // Безопасное извлечение и форматирование данных
  const bikeName = String(bike.name || 'Электровелосипед');
  const bikePower = String(bike.motor || '500W');
  const bikeSpeed = String(bike.speed || '45 км/ч');
  const bikeBattery = String(bike.range || 'до 60 км');
  const bikePrice = String(bike.pricePerDay || '500');
  const bikeWaterproof = bike.isWaterproof ? 'IP65 Полная' : 'Базовая';

  const isAvailable = String(bike.status).toUpperCase() === 'FREE';

  // Текстовые константы во избежание сбоев JSX-парсера
  const txtSpeedLabel = "Макс. скорость";
  const txtBatteryLabel = "Запас хода";
  const txtPowerLabel = "Мощность мотора";
  const txtWaterLabel = "Гидроизоляция";
  const txtPriceSuffix = " ₽ / сут";
  const txtStatusFree = "Свободен";
  const txtStatusRented = "В прокате";
  const txtBtnBook = "Забронировать";
  const txtBtnLocked = "В аренде";

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-amber-500/5">
      <div>
        
        {/* Премиальное превью байка с неоновой подложкой */}
        <div className="w-full h-44 bg-slate-950/80 rounded-2xl flex items-center justify-center relative overflow-hidden mb-6 border border-slate-800/50 group-hover:border-slate-700/50 transition-colors">
          <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {bike.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bike.imageUrl} alt={bikeName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 select-none">🚲</span>
          )}
          
          {/* Верхний шильдик мощности */}
          <div className="absolute top-3 right-3 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-amber-400 shadow-md">
            {bikePower}
          </div>
        </div>

        {/* Заголовок карточки и динамический статус */}
        <div className="flex justify-between items-start gap-3 mb-1">
          <h3 className="text-xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">
            {bikeName}
          </h3>
          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider select-none shrink-0 ${
            isAvailable 
              ? 'text-emerald-400 bg-green-500/5 border-emerald-500/20 shadow-sm shadow-emerald-500/5' 
              : 'text-slate-500 bg-slate-950/50 border-slate-800'
          }`}>
            {isAvailable ? txtStatusFree : txtStatusRented}
          </span>
        </div>
        

        {/* Сетка фич и характеристик (Инфографика в стиле Наобгон) */}
        <div className="space-y-3 border-t border-slate-800/60 pt-4 mb-6 text-xs font-mono">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500">{txtSpeedLabel}</span>
            <span className="text-slate-200 font-bold">{bikeSpeed}</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500">{txtBatteryLabel}</span>
            <span className="text-slate-200 font-bold">{bikeBattery}</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500">{txtPowerLabel}</span>
            <span className="text-slate-200 font-bold">{bikePower}</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500">{txtWaterLabel}</span>
            <span className="text-amber-400/90 font-bold">{bikeWaterproof}</span>
          </div>
        </div>

      </div>

      {/* Финансовый блок и кнопка бронирования */}
      <div className="border-t border-slate-800/60 pt-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider select-none">Стоимость</p>
          <p className="text-xl font-black text-white mt-0.5 tracking-tight">
            {bikePrice}
            <span className="text-xs text-slate-400 font-medium font-mono">{txtPriceSuffix}</span>
          </p>
        </div>
        
        <button
          type="button"
          disabled={!isAvailable}
          onClick={() => onBook(bike)}
          className={`px-5 py-3.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-md ${
            isAvailable 
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:shadow-lg hover:shadow-amber-500/10 hover:from-amber-400 hover:to-yellow-400 cursor-pointer' 
              : 'bg-slate-800/50 text-slate-500 border border-slate-800/30 cursor-not-allowed'
          }`}
        >
          {isAvailable ? txtBtnBook : txtBtnLocked}
        </button>
      </div>

    </div>
  );
}
