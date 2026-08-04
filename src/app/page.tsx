'use client';

import React from 'react';
import HomeCatalog from './HomeCatalog';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      
      <header className="relative max-w-7xl mx-auto px-4 pt-16 pb-20 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
          Аренда Электровелосипедов <br />
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            Для Курьеров №1
          </span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg mb-8 leading-relaxed">
          Зарабатывайте больше без усталости на мощных Monster-байках. Никаких залогов, честный запас хода и бесплатный ремонт на весь период аренды.
        </p>
        <a href="#catalog" className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold px-8 py-4 rounded-xl shadow-xl shadow-orange-500/20 transform hover:-translate-y-0.5 transition-all duration-200">
          Выбрать велосипед
        </a>
      </header>

      <section id="catalog" className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100">Доступные models в Уфе</h2>
          <p className="text-sm text-slate-500 mt-1">Все байки проходят полное ТО перед выдачей</p>
        </div>

        <HomeCatalog />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 bg-slate-900/10 border-y border-slate-900/50">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100">Почему выбирают Elbiko</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 h-64 group md:col-span-2">
            <div className="absolute inset-0 bg-cover bg-center grayscale opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-500" style={{ backgroundImage: "url('/images/no-deposit.jpg')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-lg font-bold text-amber-500 mb-1">Без депозита и залога</h3>
              <p className="text-sm text-slate-300">Начинайте зарабатывать с первого дня без скрытых платежей.</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 h-64 group md:col-span-1">
            <div className="absolute inset-0 bg-cover bg-center grayscale opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-500" style={{ backgroundImage: "url('/images/service.jpg')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-lg font-bold text-amber-500 mb-1">Бесплатный сервис</h3>
              <p className="text-sm text-slate-300">Ремонт и ТО за наш счет за 15 минут.</p>
            </div>
          </div>

        </div>
      </section>

      <footer className="border-t border-slate-900 mt-20 bg-slate-950 py-8 text-center text-sm text-slate-600">
        <p>© 2026 Elbiko Eco-Sharing. Все права защищены. Разработано для курьеров.</p>
      </footer>

    </div>
  );
}
