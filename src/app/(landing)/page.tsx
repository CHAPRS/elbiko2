'use client';
import React, { useEffect, useState } from 'react';
import BikeCard from './BikeCard';
import OrderModal from './OrderModal';

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
    <div className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-yellow-500 selection:text-slate-950">
      
      {/* Шапка / Навигация */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white tracking-tighter font-mono">ELBIKO.</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#catalog" className="hover:text-white transition-colors">Каталог</a>
            <a href="#steps" className="hover:text-white transition-colors">Как начать</a>
            <a href="#faq" className="hover:text-white transition-colors">Вопросы</a>
            <a href="#contacts" className="hover:text-white transition-colors">Контакты</a>
          </nav>
          <a href="/admin" className="text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:border-yellow-500/50 px-4 py-2 rounded-xl transition-all">
            Диспетчерская
          </a>
        </div>
      </header>

      {/* Главный баннер (Hero) */}
      <main className="max-w-7xl mx-auto px-6 py-16 sm:py-24 space-y-24">
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Аренда мощных электровелосипедов для курьеров
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Зарабатывай больше с надежным транспортом Elbiko. Полное обслуживание, подменные АКБ и ремонт за наш счет.
          </p>
          <div className="pt-4">
            <a href="#catalog" className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-xl inline-block hover:shadow-yellow-500/10 transition-all active:scale-98">
              Выбрать электровелосипед
            </a>
          </div>
        </section>

        {/* Раздел 1. КАТАЛОГ */}
        <section id="catalog" className="space-y-8 scroll-mt-24">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Доступные модели в вашем городе</h2>
            <p className="text-sm text-slate-500 mt-1">Все байки проходят ежедневный технический осмотр</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {totalBikesFound === 0 ? catalogLoadingText : bikesRenderList}
          </div>
        </section>

        {/* Раздел 2. КАК НАЧАТЬ РАБОТАТЬ (Onboarding) */}
        <section id="steps" className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-12 scroll-mt-24">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white">4 шага до первой доставки</h2>
            <p className="text-sm text-slate-500 mt-1">Выход на смену в день обращения за 15 минут</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono font-black flex items-center justify-center text-sm shadow-md">01</div>
              <h4 className="font-bold text-white text-base">Оставьте заявку</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Выберите подходящую модель в каталоге выше и забронируйте её в один клик.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono font-black flex items-center justify-center text-sm shadow-md">02</div>
              <h4 className="font-bold text-white text-base">Подтвердите СМС</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Наш менеджер мгновенно свяжется с вами для верификации профиля.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono font-black flex items-center justify-center text-sm shadow-md">03</div>
              <h4 className="font-bold text-white text-base">Заберите байк</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Приходите в наш офис выдачи с паспортом, оформление займет не более 10 минут.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono font-black flex items-center justify-center text-sm shadow-md">04</div>
              <h4 className="font-bold text-white text-base">Получайте доход</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Катайтесь без ограничений по пробегу. Ремонт и замена расходников — бесплатно.</p>
            </div>
          </div>
        </section>

        {/* Раздел 3. БЛОК FAQ */}
        <section id="faq" className="max-w-3xl mx-auto space-y-8 scroll-mt-24">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Часто задаваемые вопросы</h2>
          </div>
          <div className="space-y-3">
            {faqRenderList}
          </div>
        </section>

        {/* Раздел 4. КОНТАКТЫ И КАРТА */}
        <section id="contacts" className="grid grid-cols-1 md:grid-cols-3 gap-8 scroll-mt-24 border-t border-slate-900 pt-16">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">Пункт выдачи Elbiko</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Главный офис и сервисный центр расположены в Уфе. Ждем вас ежедневно.
            </p>
            <div className="space-y-2 text-xs font-mono text-slate-300">
              <p><span className="text-slate-500">Адрес:</span> ул. Менделеева, д. 134</p>
              <p><span className="text-slate-500">Часы:</span> 09:00 — 21:00 ежедневно</p>
              <p><span className="text-slate-500">Телефон:</span> +7 (347) 200-00-00</p>
            </div>
          </div>
          
          <div className="md:col-span-2 h-72 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 bg-slate-950/20 z-10 pointer-events-none" />
            <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-500">
              Интерактивная карта офиса Elbiko загружена...
            </div>
          </div>
        </section>

      </main>

      {/* Футер */}
      <footer className="border-t border-slate-900 mt-24 py-8 bg-slate-950">

</footer>