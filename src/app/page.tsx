'use client';
import React, { useEffect, useState } from 'react';
import BikeCard from './(landing)/BikeCard';
import OrderModal from './(landing)/OrderModal';
import Hero from '@/components/Hero';
import HeroDB from '@/components/HeroDB';
import HowItWorks from '@/components/HowItWorks';
import HowItWorksDB from '@/components/HowItWorksDB';
import Features from '@/components/Features';
import FeaturesDB from '@/components/FeaturesDB';
import Tariffs from '@/components/Tariffs';
import TariffsDB from '@/components/TariffsDB';
import Reviews from '@/components/Reviews';
import Business from '@/components/Business';
import Repair from '@/components/Repair';
import Header from '@/components/Header';
import { ContactModal } from '@/components/ContactModal';
import CompactCatalog from '@/components/CompactCatalog';
import { useRentStore } from '@/store/useRentStore';
import { getHeroFromDB, getTariffsFromDB, getFeaturesFromDB, getStepsFromDB } from '@/lib/contentQueries';
import { CONTACTS, SHOW_REPAIR_SECTION } from '@/app/constants';

export default function HomePage() {
  const [bikes, setBikes] = useState<any[]>([]);
  const [selectedBike, setSelectedBike] = useState<any | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const { toggleContactModal, toggleAuthModal, toggleBookingModal } = useRentStore();
  
  // DB data states
  const [heroData, setHeroData] = useState<any>(null);
  const [tariffsData, setTariffsData] = useState<any[]>([]);
  const [featuresData, setFeaturesData] = useState<any[]>([]);
  const [stepsData, setStepsData] = useState<any[]>([]);

  // Сброс всех модальных окон при загрузке страницы
  useEffect(() => {
    toggleContactModal(false);
    toggleAuthModal(false);
    toggleBookingModal(false);
  }, []);

  useEffect(() => {
    fetch('/api/bikes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBikes(data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch DB data
  useEffect(() => {
    const fetchDBData = async () => {
      try {
        const [hero, tariffs, features, steps] = await Promise.all([
          getHeroFromDB(),
          getTariffsFromDB(),
          getFeaturesFromDB(),
          getStepsFromDB()
        ]);
        setHeroData(hero);
        setTariffsData(tariffs);
        setFeaturesData(features);
        setStepsData(steps);
      } catch (error) {
        console.error('Error fetching DB data:', error);
      }
    };
    fetchDBData();
  }, []);

  // =========================================================
  // ПРЕДВАРИТЕЛЬНАЯ СБОРКА КОНТЕНТА (Чистый JavaScript)
  // =========================================================

  // 1. Сборка FAQ-аккордеона
  const faqItems = [
    { q: "Что нужно для оформления договора?", a: "Только паспорт гражданина РФ или СНГ и минимальный возраст от 18 лет. Никаких скрытых залогов." },
    { q: "Как происходит замена аккумулятора?", a: "Если аккумулятор вышел из строя мы заменим его на заряженный без дополнительных плат" },
    { q: "Кто платит за ремонт в случае поломки?", a: "Естественный износ (тормоза, спицы, цепь, покрышки) мы чиним полностью бесплатно в нашей мастерской. Если поломки являются результатом не аккуратной эксплуатации, то сумму ремонта согласовываем по факту." }
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
          <span className="text-emerald-400 group-hover:scale-110 transition-transform">
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
      {heroData ? <HeroDB data={heroData} /> : <Hero />}

      {/* Как это работает */}
      <section id="how-it-works" className="scroll-mt-24">
        {stepsData.length > 0 ? <HowItWorksDB steps={stepsData} /> : <HowItWorks />}
      </section>

      {/* Преимущества */}
      {featuresData.length > 0 ? <FeaturesDB features={featuresData} /> : <Features />}

      {/* Компактный каталог после преимуществ */}
      <CompactCatalog bikes={bikes} onBook={(b) => setSelectedBike(b)} />

      {/* Тарифы */}
      {tariffsData.length > 0 ? <TariffsDB tariffs={tariffsData} /> : <Tariffs />}

      {/* Отзывы */}
      <Reviews />

      {/* Для бизнеса */}
      <Business />

      {/* Ремонт — временно скрыт через SHOW_REPAIR_SECTION */}
      {SHOW_REPAIR_SECTION && <Repair />}

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
          <h2 className="text-2xl font-black text-white">Пункт выдачи ЭльБайко</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Главный офис и сервисный центр. Ждем вас ежедневно.
          </p>
          <div className="space-y-2 text-sm font-mono text-slate-300">
            <p><span className="text-slate-500">Адрес:</span> Салмышская улица, 44, Оренбург</p>
            <p><span className="text-slate-500">Часы:</span> 09:00 — 21:00 ежедневно</p>
            <p><span className="text-slate-500">Телефон:</span> {CONTACTS.phoneDisplay}</p>
          </div>
          
          {/* Contact buttons */}
          <div className="space-y-3 pt-4">
            <a
              href={`tel:${CONTACTS.phone}`}
              className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-all hover:bg-slate-800 hover:border-emerald-500/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Позвонить
            </a>
            <a
              href={CONTACTS.telegramBot}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold rounded-xl transition-all hover:bg-emerald-500/30 hover:border-emerald-500/50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
              Заказать звонок
            </a>
            <div className="flex gap-3">
              <a
                href={CONTACTS.telegramManager}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold rounded-xl transition-all hover:bg-blue-500/30 hover:border-blue-500/50"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                Telegram
              </a>
              {CONTACTS.maxUrl ? (
                <a
                  href={CONTACTS.maxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 font-semibold rounded-xl transition-all hover:bg-purple-500/30 hover:border-purple-500/50"
                >
                  <span className="w-4 h-4 flex items-center justify-center text-xs bg-purple-500/30 rounded">MAX</span>
                  MAX
                </a>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 text-slate-400 font-semibold rounded-xl">
                  <span className="w-4 h-4 flex items-center justify-center text-xs bg-slate-700 rounded">MAX</span>
                  {CONTACTS.maxPhoneDisplay}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2 h-72 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative shadow-inner">
          <iframe 
            src="https://yandex.ru/map-widget/v1/?ll=55.165434,51.823143&z=15&pt=55.165434,51.823143,pm2rdm&lang=ru_RU"
            width="100%" 
            height="100%" 
            frameBorder="0" 
            style={{ border: 0 }}
            allowFullScreen
            title="Карта офиса ЭльБайко"
          />
        </div>
      </section>

      {/* Футер */}
      <footer className="border-t border-slate-900 mt-24 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* О компании */}
            <div>
              <h3 className="text-white font-bold mb-4">ЭльБайко</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Надёжные электровелосипеды в аренду для курьеров в Оренбурге. Готовый транспорт, выгодные тарифы и сервис на весь срок аренды.
              </p>
              <div className="mt-4 text-sm text-slate-400">
                <p>📍 Салмышская улица, 44</p>
                <p>🕐 09:00 — 21:00 ежедневно</p>
              </div>
            </div>
            
            {/* Навигация */}
            <div>
              <h3 className="text-white font-bold mb-4">Навигация</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#catalog" className="hover:text-emerald-400 transition-colors">Каталог</a></li>
                <li><a href="#tariffs" className="hover:text-emerald-400 transition-colors">Тарифы</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Как арендовать</a></li>
                <li><a href="#advantages" className="hover:text-emerald-400 transition-colors">Преимущества</a></li>
              </ul>
            </div>
            
            {/* Контакты */}
            <div>
              <h3 className="text-white font-bold mb-4">Связаться с нами</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={`tel:${CONTACTS.phone}`}
                    className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {CONTACTS.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={CONTACTS.telegramBot}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                    </svg>
                    Заказать звонок
                  </a>
                </li>
                <li>
                  <a
                    href={CONTACTS.telegramManager}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                    </svg>
                    Telegram менеджера
                  </a>
                </li>
                {CONTACTS.maxUrl ? (
                  <li>
                    <a
                      href={CONTACTS.maxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <span className="w-4 h-4 flex items-center justify-center text-xs bg-purple-500/20 text-purple-400 rounded">MAX</span>
                      MAX
                    </a>
                  </li>
                ) : (
                  <li className="flex items-center gap-2 text-slate-400">
                    <span className="w-4 h-4 flex items-center justify-center text-xs bg-slate-700 rounded">MAX</span>
                    {CONTACTS.maxPhoneDisplay}
                  </li>
                )}
              </ul>
            </div>
            
            {/* Документы */}
            <div>
              <h3 className="text-white font-bold mb-4">Документы</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Политика конфиденциальности</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Правила эксплуатации</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Договор оферты</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-900 pt-8 text-center">
            <div className="text-sm text-slate-500">
              © 2024 ЭльБайко. Все права защищены.
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

      {/* Модалка выбора способа связи */}
      <ContactModal />
    </div>
  );
}