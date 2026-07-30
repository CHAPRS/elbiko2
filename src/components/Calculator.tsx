'use client';
import React from 'react';
import { useRentStore } from '@/store/useRentStore';

export default function Calculator() {
  const { rentDays: days, setRentDays: setDays, toggleBookingModal, selectBike } = useRentStore();
  const basePricePerDay = 500;
  
  const getPricePerDay = (d: number) => {
    if (d >= 30) return 400;
    if (d >= 14) return 450;
    return basePricePerDay;
  };

  const currentPricePerDay = getPricePerDay(days);
  const totalPrice = days * currentPricePerDay;
  const buyingCost = 80000; 
  const economy = buyingCost - totalPrice > 0 ? buyingCost - totalPrice : 0;

  const handleBooking = () => {
    selectBike({ id: '1', name: 'Minako V8 Pro', range: 'до 60 км', speed: 'до 45 км/ч', power: '500W', pricePerDay: 500 });
    toggleBookingModal(true);
  };

  return (
    <section id="calculator" className="px-4 py-16 bg-slate-950">
      <div className="mx-auto max-w-md p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-slate-100">Рассчитайте стоимость</h2>
        
        <div className="mt-8">
          <div className="flex justify-between text-sm font-medium text-slate-400">
            <span>Срок аренды</span>
            <span className="text-yellow-400 font-bold">{days} дней</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full h-2 mt-4 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>1 день</span>
            <span>14 дней</span>
            <span>30 дней</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Цена за день:</span>
            <span className="text-xl font-bold text-slate-200">{currentPricePerDay} ₽</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Итого к оплате:</span>
            <span className="text-3xl font-black text-yellow-400">{totalPrice} ₽</span>
          </div>
          {economy > 0 && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs text-center rounded-xl font-medium">
              Экономия по сравнению с покупкой: ~{economy.toLocaleString()} ₽
            </div>
          )}
        </div>

        <button onClick={handleBooking} className="w-full mt-6 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl transition-transform active:scale-95">
          Забронировать на {days} дн.
        </button>
      </div>
    </section>
  );
}
