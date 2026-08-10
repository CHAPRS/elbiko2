'use client';
import React from 'react';

export default function Hero() {
  // Временные данные - будут заменены на данные из Sanity
  const heroData = {
    badge: 'Для Курьеров',
    title: 'Аренда электровелосипедов для курьеров',
    titleHighlight: 'в Оренбурге',
    subtitle: 'Доставляй быстрее. Зарабатывай больше. Современные электровелосипеды с обслуживанием под ключ.',
    stats: [
      { value: '60+', label: 'км без подзарядки' },
      { value: '2×', label: 'больше заказов' },
      { value: '3', label: 'тарифа аренды' }
    ],
    cta: {
      text: 'Выбрать тариф',
      link: '#tariffs'
    },
    secondaryCta: {
      text: 'Смотреть каталог',
      link: '#catalog'
    }
  };

  return (
    <section className="relative flex flex-col justify-center items-center px-4 py-20 lg:py-32 min-h-screen text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute top-4 left-4 bg-emerald-500/20 text-emerald-400 font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-emerald-500/30">
        {heroData.badge}
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-100 leading-tight">
          {heroData.title}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            {heroData.titleHighlight}
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
          {heroData.subtitle}
        </p>
        
        {/* Статистика как на webike24.ru */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto pt-8">
          {heroData.stats.map((stat, index) => (
            <div key={index} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <a
            href={heroData.cta.link}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl text-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
          >
            {heroData.cta.text}
          </a>
          <a
            href={heroData.secondaryCta.link}
            className="px-8 py-4 bg-slate-800 text-slate-200 font-bold rounded-xl text-lg transition-all border border-slate-700 hover:bg-slate-700 active:scale-95"
          >
            {heroData.secondaryCta.text}
          </a>
        </div>
      </div>
    </section>
  );
}
