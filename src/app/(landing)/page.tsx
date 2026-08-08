'use client';
import React, { useEffect, useState } from 'react';
import BikeCard from './BikeCard';
import OrderModal from './OrderModal';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import Tariffs from '@/components/Tariffs';
import Reviews from '@/components/Reviews';
import Business from '@/components/Business';
import Repair from '@/components/Repair';
import Header from '@/components/Header';

export default function HomePage() {
  const [bikes, setBikes] = useState<any[]>([]);
  const [selectedBike, setSelectedBike] = useState<any | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.bikes)) {
          setBikes(data.bikes);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // =========================================================
  // ПРЕДВАРИТЕЛЬНАЯ СБОРКА КОНТЕНТА (Чистый JavaScript)
  // =========================================================

  // 1. Сборка списка велосипедов (СКОБКИ ИСПРАВЛЕНЫ)
  const bikesRenderList = bikes.map((bike) => (
    <BikeCard key={bike.id} bike={bike} onBook={(b) => setSelectedBike(b)} />
  ));

  // Заглушка для каталога
  const catalogLoadingText = (
    <div className="col-span-full p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-slate-500 font-mono text-sm">
      Загрузка актуального автопарка Elbiko...
    </div>
  );

  // 2. Сборка FAQ-аккордеона
  const faqItems = [
    { q: "Что нужно для оформления договора?", a: "Только паспорт гражданина РФ или СНГ и минимальный возраст от 18 лет. Никаких скрытых залогов." },
    { q: "Как происходит замена аккумулятора?", a: "Вы можете бесплатно заменить севший АКБ на полностью заряженный в любом из наших пунктов выдачи в течение смены." },
    { q: "Кто платит за ремонт в случае поломки?", a: "Естественный износ (тормоза, спицы, цепь, покрышки) мы чиним полностью бесплатно в нашей мастерской." }
  ];

  const faqRenderList = faqItems.map((item, idx) => {
    const isCurrentOpen = faqOpen === idx;
    const buttonSign = isCurrentOpen ? '−' : '+';
    
    return (
      <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => setFaqOpen(isCurrentOpen ? null : idx)}
          className="w-full p-5 text-left font-bold text-sm text-white flex justify-between items-center group focus:outline-none"
        >
          <span>{item.q}</span>
          <span className="text-yellow-400 group-hover:scale-110 transition-transform">
            {buttonSign}
          </span>
        </button>
        {isCurrentOpen && (
          <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
            {item.a}
          </div>
        )}
      </div>
    );
  });

  const totalBikesFound = bikes.length;

  // =========================================================
  // АБСОЛЮТНО ЛИНЕЙНАЯ И БЕЗОПАСНАЯ РАЗМЕТКА
  // =========================================================
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Шапка / Навигация */}
      <Header />

      {/* Главный баннер (Hero) */}
      <Hero />

      {/* Как это работает */}
      <HowItWorks />

      {/* Преимущества */}
      <Features />

      {/* Тарифы */}
      <Tariffs />

      {/* Каталог велосипедов */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <section id="catalog" className="space-y-8 scroll-mt-24">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Доступные модели в вашем городе</h2>
            <p className="text-sm text-slate-500 mt-1">Все байки проходят ежедневный технический осмотр</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {totalBikesFound === 0 ? catalogLoadingText : bikesRenderList}
          </div>
        </section>
      </main>

      {/* Отзывы */}
      <Reviews />

      {/* Для бизнеса */}
      <Business />

      {/* Ремонт */}
      <Repair />

      {/* FAQ секция */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20 space-y-8 scroll-mt-24">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Часто задаваемые вопросы</h2>
        </div>
        <div className="space-y-3">
          {faqRenderList}
        </div>
      </section>

      {/* Контакты и карта */}
      <section id="contacts" className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8 scroll-mt-24 border-t border-slate-900">
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white">Пункт выдачи ELBIKO</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Главный офис и сервисный центр. Ждем вас ежедневно.
          </p>
          <div className="space-y-2 text-sm font-mono text-slate-300">
            <p><span className="text-slate-500">Адрес:</span> ул. Ястынская 6а, Красноярск</p>
            <p><span className="text-slate-500">Часы:</span> 09:00 — 21:00 ежедневно</p>
            <p><span className="text-slate-500">Телефон:</span> +7 (987) 847-92-89</p>
          </div>
        </div>
        
        <div className="md:col-span-2 h-72 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative shadow-inner">
          <div className="absolute inset-0 bg-slate-950/20 z-10 pointer-events-none" />
          <div className="w-full h-full flex items-center justify-center text-sm font-mono text-slate-500">
            Интерактивная карта офиса ELBIKO загружена...
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="border-t border-slate-900 mt-24 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500">
              © 2024 ELBIKO. Все права защищены.
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-emerald-400 transition-colors">Политика конфиденциальности</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Правила эксплуатации</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Договор оферты</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Модалка заказа */}
      {selectedBike && (
        <OrderModal 
          bike={selectedBike} 
          onClose={() => setSelectedBike(null)} 
        />
      )}
    </div>
  );
}