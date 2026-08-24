'use client';
import React from 'react';
import Image from 'next/image';

interface Benefit {
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  isMain?: boolean;
  badges?: string[];
}

const benefits: Benefit[] = [
  {
    title: 'Готов к работе',
    description: 'Получите готовый электровелосипед и выходите на линию без покупки собственного транспорта.',
    icon: '🚴',
    imageUrl: '/images/вид три четверти спереди.jpg',
    isMain: true,
    badges: ['Для работы курьером', 'В аренду', 'Готовый транспорт']
  },
  {
    title: 'Экономично',
    description: 'Аренда вместо покупки собственного транспорта.',
    icon: '⚡',
    isMain: false
  },
  {
    title: 'Сервис',
    description: 'Техническая поддержка и обслуживание.',
    icon: '🔧',
    isMain: false
  },
  {
    title: 'Запас энергии',
    description: 'Аккумуляторы на весь рабочий день.',
    icon: '🔋',
    isMain: false
  },
  {
    title: 'Поддержка',
    description: 'Поможем с арендой и эксплуатацией.',
    icon: '📞',
    isMain: false
  }
];

export default function Features() {
  const mainBenefit = benefits[0];
  const secondaryBenefits = benefits.slice(1);

  return (
    <section id="advantages" className="py-8 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1.5 bg-emerald-500/20 text-emerald-400 font-black text-xs uppercase tracking-wider rounded-full border border-emerald-500/30 mb-3">
            ПОЧЕМУ ЭльБайко
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 mb-2">
            Всё для работы курьером
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Всё необходимое для комфортной работы — в одной аренде.
          </p>
        </div>

        {/* Desktop: Bento Grid */}
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-4">
          {/* Главная карточка — 3 из 5 колонок, примерно 60% */}
          <div className="lg:col-span-3 relative h-[320px] bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            {mainBenefit.imageUrl && (
              <Image
                src={mainBenefit.imageUrl}
                alt={mainBenefit.title}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{mainBenefit.icon}</span>
                <h3 className="text-2xl font-black text-slate-100">
                  {mainBenefit.title}
                </h3>
              </div>
              <p className="text-slate-300 text-sm max-w-md mb-3">
                {mainBenefit.description}
              </p>
              {mainBenefit.badges && (
                <div className="flex flex-wrap gap-2">
                  {mainBenefit.badges.map((badge, index) => (
                    <span key={index} className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black rounded-full">
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4 карточки справа — 2×2 сетка */}
          <div className="lg:col-span-2 grid grid-cols-2 grid-rows-2 gap-4">
            {secondaryBenefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 hover:border-emerald-500/30 transition-all duration-300 group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-base font-bold text-emerald-400 mb-1">
                  {benefit.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tablet: Главная карточка сверху + 4 маленькие 2×2 */}
        <div className="hidden md:grid lg:hidden md:grid-cols-2 md:gap-4">
          <div className="md:col-span-2 relative h-64 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            {mainBenefit.imageUrl && (
              <Image
                src={mainBenefit.imageUrl}
                alt={mainBenefit.title}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{mainBenefit.icon}</span>
                <h3 className="text-xl font-black text-slate-100">
                  {mainBenefit.title}
                </h3>
              </div>
              <p className="text-slate-300 text-sm max-w-lg mb-2">
                {mainBenefit.description}
              </p>
              {mainBenefit.badges && (
                <div className="flex flex-wrap gap-2">
                  {mainBenefit.badges.map((badge, index) => (
                    <span key={index} className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black rounded-full">
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {secondaryBenefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 hover:border-emerald-500/30 transition-all duration-300 group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                {benefit.icon}
              </div>
              <h3 className="text-base font-bold text-emerald-400 mb-1">
                {benefit.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile: Вертикальная сетка */}
        <div className="md:hidden space-y-3">
          {/* Главная карточка */}
          <div className="relative h-56 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            {mainBenefit.imageUrl && (
              <Image
                src={mainBenefit.imageUrl}
                alt={mainBenefit.title}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{mainBenefit.icon}</span>
                <h3 className="text-lg font-black text-slate-100">
                  {mainBenefit.title}
                </h3>
              </div>
              <p className="text-slate-300 text-xs max-w-md mb-2">
                {mainBenefit.description}
              </p>
              {mainBenefit.badges && (
                <div className="flex flex-wrap gap-1">
                  {mainBenefit.badges.map((badge, index) => (
                    <span key={index} className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black rounded-full">
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4 маленькие карточки */}
          <div className="grid grid-cols-2 gap-3">
            {secondaryBenefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 hover:border-emerald-500/30 transition-all duration-300 group"
              >
                <div className="text-xl mb-1.5 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-sm font-bold text-emerald-400 mb-0.5">
                  {benefit.title}
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
