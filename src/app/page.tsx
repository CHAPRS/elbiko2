"use client";

import React from "react";
import HomeCatalog from "./HomeCatalog";

export default function HomePage() {
  // --- ПЛОСКИЕ ДАННЫЕ ДЛЯ ИЗОЛЯЦИИ РАЗМЕТКИ (ОБЯЗАТЕЛЬНО) ---
  
  // Ссылки в шапке
  const navLinks = [
    <a key="catalog" href="#catalog" className="text-sm text-slate-300 hover:text-lime-400 font-medium transition-colors">Велокаталог</a>,
    <a key="tg" href="https://t.me" target="_blank" className="text-sm text-slate-300 hover:text-lime-400 font-medium transition-colors">Telegram</a>,
    <a key="support" href="https://t.me" target="_blank" className="text-sm text-slate-300 hover:text-lime-400 font-medium transition-colors">Поддержка</a>
  ];

    // Обновленный перечень шагов с иконками, эффектами и контрастной графикой
  const stepsItems = [
    <div key="step1" className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-lime-500/5 hover:-translate-y-1.5 duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-lime-400/5 rounded-bl-full flex items-center justify-center text-slate-200 text-3xl font-black group-hover:bg-lime-400/10 transition-colors">
        01
      </div>
      <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-2xl mb-6 shadow-md border border-slate-800">
        📝
      </div>
      <h3 className="text-slate-950 font-black text-lg mb-2 group-hover:text-lime-600 transition-colors">
        Оставить заявку
      </h3>
      <p className="text-slate-600 text-xs leading-relaxed">
        Выберите подходящий электровелосипед в нашем каталоге ниже и нажмите кнопку «Оформить».
      </p>
    </div>,
    <div key="step2" className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-lime-500/5 hover:-translate-y-1.5 duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-lime-400/5 rounded-bl-full flex items-center justify-center text-slate-200 text-3xl font-black group-hover:bg-lime-400/10 transition-colors">
        02
      </div>
      <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-2xl mb-6 shadow-md border border-slate-800">
        📱
      </div>
      <h3 className="text-slate-950 font-black text-lg mb-2 group-hover:text-lime-600 transition-colors">
        Подтвердить профиль
      </h3>
      <p className="text-slate-600 text-xs leading-relaxed">
        Пройдите быструю моментальную проверку по номеру телефона в вашем личном кабинете курьера.
      </p>
    </div>,
    <div key="step3" className="p-8 rounded-3xl bg-slate-950 border border-slate-900 shadow-xl transition-all hover:shadow-2xl hover:shadow-lime-500/10 hover:-translate-y-1.5 duration-300 relative overflow-hidden text-white">
      <div className="absolute top-0 right-0 w-24 h-24 bg-lime-400/10 rounded-bl-full flex items-center justify-center text-slate-800 text-3xl font-black">
        03
      </div>
      <div className="w-14 h-14 rounded-2xl bg-lime-400 flex items-center justify-center text-2xl mb-6 shadow-md shadow-lime-500/20">
        ⚡
      </div>
      <h3 className="text-white font-black text-lg mb-2 text-lime-400">
        Забрать байк
      </h3>
      <p className="text-slate-400 text-xs leading-relaxed">
        Получите полностью заряженный и готовый к работе MonStar в ближайшем пункте выдачи и начните смену.
      </p>
    </div>
  ];

  // Блок отзывов (Светлые карточки с салатовыми звездами)
  const reviewsItems = [
    <div key="rev1" className="p-6 rounded-2xl bg-slate-900 border border-slate-800/80">
      <div className="flex items-center gap-1 text-lime-400 mb-2">★★★★★</div>
      <p className="text-slate-300 text-xs italic mb-3">"Отличный MonStar PRO! Заряда АКБ железно хватает на всю смену. Тормоза гидравлика — супер."</p>
      <span className="text-slate-400 text-[11px] font-semibold tracking-wide">— Артур, курьер в Спб</span>
    </div>,
    <div key="rev2" className="p-6 rounded-2xl bg-slate-900 border border-slate-800/80">
      <div className="flex items-center gap-1 text-lime-400 mb-2">★★★★★</div>
      <p className="text-slate-300 text-xs italic mb-3">"Взял Ultima Long. Рама усиленная, бордюры вообще не замечает. Амортизация спасает спину."</p>
      <span className="text-slate-400 text-[11px] font-semibold tracking-wide">— Дмитрий, Москва</span>
    </div>
  ];

  // Ссылки в футере
  const footerLinks = [
    <a key="f1" href="#" className="text-xs text-slate-500 hover:text-slate-400 font-medium">Правила движения</a>,
    <a key="f2" href="#" className="text-xs text-slate-500 hover:text-slate-400 font-medium">Правила эксплуатации</a>,
    <a key="f3" href="#" className="text-xs text-slate-500 hover:text-slate-400 font-medium">Политика конфиденциальности</a>
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-lime-400 selection:text-black">
      
      {/* ТЕМНО-СИНИЙ HEADER С САЛАТОВЫМ ЛОГО */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-wider text-white">ELBIKO</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-lime-400 text-slate-950 uppercase tracking-widest font-black">Eco</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {navLinks}
          </nav>
          
          <div>
            <a 
              href="/login" 
              className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-sm font-bold transition-all shadow-md shadow-lime-500/10 active:scale-95"
            >
              Личный кабинет
            </a>
          </div>
        </div>
      </header>

      {/* ГЛУБОКИЙ ТЕМНО-СИНИЙ БАННЕР С НЕОНОВЫМ АКЦЕНТОМ */}
      <section className="relative overflow-hidden py-28 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-900">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-block text-xs font-bold bg-lime-400/10 text-lime-400 px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-lime-400/20">
            Эко-прокат нового поколения
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 uppercase leading-tight">
            Электровелосипеды в аренду <br />
            <span className="text-lime-400">для курьеров</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
            Технологичный и выносливый транспорт. Фирменные аккумуляторы LiFePO4, полная влагозащита электроники и надежный круиз-контроль.
          </p>
          <div className="flex justify-center">
            <a href="#catalog" className="px-8 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl transition-all shadow-lg active:scale-95">
              Выбрать велосипед
            </a>
          </div>
        </div>
      </section>

      {/* КОНТРАСТНАЯ ЧИСТАЯ БЕЛАЯ СЕКЦИЯ: КАК НАЧАТЬ РАБОТАТЬ */}
      <section className="py-20 px-4 bg-white text-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black text-center text-slate-950 mb-12 uppercase tracking-wide">
            Как начать работать
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stepsItems}
          </div>
        </div>
      </section>

      {/* СЕКЦИЯ КАТАЛОГА ВЕЛОСИПЕДОВ (Темно-синяя основа под HomeCatalog) */}
      <section id="catalog" className="py-20 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Наш автопарк</h2>
            <p className="text-slate-500 text-xs mt-1 font-semibold uppercase tracking-wider text-lime-400/80">Доступные модели в вашем городе</p>
          </div>
          
          <div className="rounded-3xl p-2 sm:p-6 bg-slate-900 border border-slate-800/60 shadow-2xl">
            <HomeCatalog />
          </div>
          
        </div>
      </section>

      {/* ОТЗЫВЫ КУРЬЕРОВ */}
      <section className="py-20 px-4 bg-slate-900/40 border-t border-b border-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-center text-white mb-12 uppercase tracking-wide">Отзывы наших курьеров</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reviewsItems}
          </div>
        </div>
      </section>

      {/* КАРТА С ТЕМНОЙ ОПРЯТНОЙ ОЛИВКОВОЙ/СИНЕЙ СТИЛИЗАЦИЕЙ ОБЕРТКИ */}
      <section className="py-20 px-4 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-center text-white mb-2 uppercase tracking-wide">Где нас найти</h2>
          <p className="text-slate-500 text-xs text-center mb-10 font-medium">Приезжайте на тест-драйв в любой удобный филиал</p>
          
          <div className="w-full h-[400px] rounded-3xl overflow-hidden border border-slate-800 shadow-xl relative">
            <iframe 
              src="https://yandex.ru" 
              width="100%" 
              height="100%" 
              className="border-0 opacity-75 hover:opacity-100 transition-opacity duration-300 invert-[0.05] hue-rotate-[180deg]"
              allowFullScreen={true}
            ></iframe>
          </div>
        </div>
      </section>

      {/* ФУТЕР САЙТА */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center sm:text-left">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} ELBIKO Eco-Sharing. Все права защищены.
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-6">
            {footerLinks}
          </div>
        </div>
      </footer>

    </div>
  );
}
