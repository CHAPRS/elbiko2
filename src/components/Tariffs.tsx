'use client';
import React from 'react';
import { useRentStore } from '@/store/useRentStore';

// Временные данные - будут заменены на данные из Sanity
const tariffs = [
  {
    name: 'Базовый',
    subtitle: '2 АКБ × 30 Ah · стандартные смены',
    price: '3 000',
    period: 'в неделю',
    features: [
      '2 аккумулятора по 30 Ah',
      'Корзина и замок в комплекте',
      'Техосмотр перед выдачей',
      'Гибкий договор'
    ],
    popular: false
  },
  {
    name: 'Заработок',
    subtitle: '2 АКБ: 30 Ah и 45 Ah · увеличенный пробег',
    price: '3 500',
    period: 'в неделю',
    features: [
      '2 аккумулятора увеличенной емкости',
      'Корзина, замок, крылья',
      'Техосмотр перед выдачей',
      'Гибкий договор',
      'Бесплатное ТО каждые 14 дней',
      'Подходит для полных рабочих дней'
    ],
    popular: true
  },
  {
    name: 'Партнер',
    subtitle: '2 АКБ × 45 Ah · для длинных смен',
    price: '15 000',
    period: 'в месяц',
    features: [
      'все из тарифа "Заработок"',
      '2 аккумулятора максимальной емкости',
      'подменный, новый аналогичный электровелосипед на время ТО',
    ],
    popular: false
  }
];

export default function Tariffs() {
  const { toggleContactModal } = useRentStore();

  const handleSelectTariff = () => {
    toggleContactModal(true, 'tariff');
  };

  return (
    <section id="tariffs" className="py-20 px-4 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">
            Тарифы аренды электровелосипедов в Оренбурге
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Выбери тариф под свой режим работы. 
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tariffs.map((tariff, index) => (
            <div 
              key={index}
              className={`relative p-8 rounded-3xl border-2 transition-all duration-300 ${
                tariff.popular 
                  ? 'bg-gradient-to-b from-emerald-500/10 to-slate-900 border-emerald-500/50' 
                  : 'bg-slate-900/50 border-slate-800 hover:border-emerald-500/30'
              }`}
            >
              {tariff.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-black text-xs px-4 py-1 rounded-full uppercase tracking-wider">
                  Популярный
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-slate-100 mb-2">{tariff.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{tariff.subtitle}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-emerald-400">{tariff.price}</span>
                  <span className="text-slate-400">₽ {tariff.period}</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                {tariff.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="text-emerald-400 mt-0.5">◆</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={handleSelectTariff}
                className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${
                tariff.popular
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:shadow-lg hover:shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
              }`}>
                Выбрать тариф
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}