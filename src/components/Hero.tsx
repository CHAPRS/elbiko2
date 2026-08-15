'use client';
import React from 'react';
import Image from 'next/image';

export default function Hero() {
  // Временные данные - будут заменены на данные из БД
  const heroData = {
    badge: 'Для Курьеров',
    title: 'Аренда электровелосипедов для курьеров',
    titleHighlight: 'в Оренбурге',
    subtitle: 'Доставляй быстрее. Зарабатывай больше. Современные электровелосипеды с обслуживанием под ключ.',
    bikeImageUrl: '/images/w720h405fill.jpg', // Путь к фото велосипеда
    phone: '+7 (987) 847-92-89',
    telegramUrl: 'https://t.me/your_telegram',
    maksUrl: 'https://maks.com/your_profile',
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
    <section className="relative flex flex-col lg:flex-row items-center justify-center px-4 py-20 lg:py-32 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute top-4 left-4 bg-emerald-500/20 text-emerald-400 font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-emerald-500/30 z-10">
        {heroData.badge}
      </div>
      
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Фото велосипеда (слева) */}
        <div className="relative h-80 sm:h-96 lg:h-auto min-h-[400px] order-2 lg:order-1 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/10 bg-slate-800">
          <Image
            src={heroData.bikeImageUrl}
            alt="Электровелосипед для курьеров"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Текст справа */}
        <div className="space-y-8 text-left order-1 lg:order-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
            {heroData.title}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {heroData.titleHighlight}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl">
            {heroData.subtitle}
          </p>
          
          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-lg pt-4">
            {heroData.stats.map((stat, index) => (
              <div key={index} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">{stat.value}</div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
          
          {/* Основные кнопки */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
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

          {/* Контакты */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a
              href={`tel:${heroData.phone}`}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-all hover:bg-slate-800 hover:border-emerald-500/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Позвонить
            </a>
            <a
              href={heroData.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold rounded-xl transition-all hover:bg-blue-500/30 hover:border-blue-500/50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
              Telegram
            </a>
            <a
              href={heroData.maksUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 font-semibold rounded-xl transition-all hover:bg-purple-500/30 hover:border-purple-500/50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Maks
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}