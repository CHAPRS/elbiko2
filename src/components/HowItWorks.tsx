'use client';
import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Оставь заявку',
    description: 'Нажми «Арендовать» или позвони нам. Ответим за 10 минут и подберём нужный тариф.'
  },
  {
    number: '02',
    title: 'Выбери тариф',
    description: 'Базовый, стандарт или премиум — в зависимости от твоего графика и длины смены.'
  },
  {
    number: '03',
    title: 'Приедь к нам',
    description: 'Оренбург, ул. Салмышская, д. 30. Подписываем договор за 15 минут. Нужен только паспорт.'
  },
  {
    number: '04',
    title: 'Вперёд!',
    description: 'Забираешь велосипед, заряженные АКБ и выходишь на первый маршрут в тот же день.'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">
            Как арендовать электровелосипед
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Выход на смену в день обращения за 15 минут
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-900/80">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-black flex items-center justify-center text-lg mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Соединительные линии для десктопа */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}