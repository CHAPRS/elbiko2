'use client';
import React, { useEffect, useState } from 'react';
import { getHero } from '@/lib/sanityQueries';

interface HeroData {
  title: string;
  subtitle: string;
  badge: string;
  stat1_label: string;
  stat1_value: string;
  stat2_label: string;
  stat2_value: string;
  stat3_label: string;
  stat3_value: string;
  cta_text: string;
  cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
}

export default function HeroSanity() {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHero() {
      try {
        const data = await getHero();
        if (data) {
          setHeroData(data);
        }
      } catch (error) {
        console.error('Failed to load hero data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadHero();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (!heroData) {
    // Fallback to static data if Sanity data not available
    return (
      <section className="relative flex flex-col justify-center items-center px-4 py-20 lg:py-32 min-h-screen text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute top-4 left-4 bg-emerald-500/20 text-emerald-400 font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-emerald-500/30">
          Для Курьеров
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Аренда электровелосипедов для курьеров{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              в Красноярске
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
            Доставляй быстрее. Зарабатывай больше. Современные электровелосипеды с обслуживанием под ключ.
          </p>
          
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto pt-8">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">50+</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">км без подзарядки</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">2×</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">больше заказов</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">3</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">тарифа аренды</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <a
              href="#tariffs"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl text-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
            >
              Выбрать тариф
            </a>
            <a
              href="#catalog"
              className="px-8 py-4 bg-slate-800 text-slate-200 font-bold rounded-xl text-lg transition-all border border-slate-700 hover:bg-slate-700 active:scale-95"
            >
              Смотреть каталог
            </a>
          </div>
        </div>
      </section>
    );
  }

  const stats = [
    { value: heroData.stat1_value, label: heroData.stat1_label },
    { value: heroData.stat2_value, label: heroData.stat2_label },
    { value: heroData.stat3_value, label: heroData.stat3_label }
  ];

  return (
    <section className="relative flex flex-col justify-center items-center px-4 py-20 lg:py-32 min-h-screen text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute top-4 left-4 bg-emerald-500/20 text-emerald-400 font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-emerald-500/30">
        {heroData.badge}
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-100 leading-tight">
          {heroData.title}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            в Красноярске
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
          {heroData.subtitle}
        </p>
        
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto pt-8">
          {stats.map((stat, index) => (
            <div key={index} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <a
            href={heroData.cta_link}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl text-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
          >
            {heroData.cta_text}
          </a>
          <a
            href={heroData.secondary_cta_link}
            className="px-8 py-4 bg-slate-800 text-slate-200 font-bold rounded-xl text-lg transition-all border border-slate-700 hover:bg-slate-700 active:scale-95"
          >
            {heroData.secondary_cta_text}
          </a>
        </div>
      </div>
    </section>
  );
}