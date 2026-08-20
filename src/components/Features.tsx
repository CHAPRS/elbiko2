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
    description: 'Получите электровелосипед и начинайте зарабатывать больше без необходимости покупать и обслуживать собственный транспорт.',
    icon: '🚴',
    imageUrl: '/images/вид три четверти спереди.jpg',
    isMain: true,
    badges: ['Для работы курьером', 'В аренду', 'Готовый транспорт']
  },
  {
    title: 'Экономично',
    description: 'Арендуйте велосипед когда нужно для работы, вместо покупки собственного транспорта.',
    icon: '⚡',
    isMain: false
  },
  {
    title: 'Сервис',
    description: 'Возникла техническая проблема — обратитесь к нам, и мы поможем решить вопрос.',
    icon: '🔧',
    isMain: false
  },
  {
    title: 'Запас энергии на всю смену',
    description: 'Меньше отвлечений на транспорт — больше времени для работы.',
    icon: '🔋',
    isMain: false
  },
  {
    title: 'Мы рядом',
    description: 'Поможем разобраться с арендой, велосипедом и эксплуатацией.',
    icon: '📞',
    isMain: false
  }
];

export default function Features() {
  return (
    <section id="advantages" className="py-20 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-400 font-black text-xs uppercase tracking-wider rounded-full border border-emerald-500/30 mb-4">
            ПОЧЕМУ ELBIKO
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 mb-4">
            Всё для работы курьером — в одной аренде
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Получаете готовый электровелосипед, понятные условия аренды и поддержку на всём сроке использования.
          </p>
        </div>

        {/* Desktop: Bento Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:gap-6">
          {/* Главная карточка - занимает 2 колонки и 2 ряда */}
          <div className="lg:col-span-2 lg:row-span-2 relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            {benefits[0].imageUrl && (
              <div className="relative h-64 lg:h-full">
                <Image
                  src={benefits[0].imageUrl}
                  alt={benefits[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{benefits[0].icon}</span>
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-100">
                  {benefits[0].title}
                </h3>
              </div>
              <p className="text-slate-300 mb-6 max-w-xl">
                {benefits[0].description}
              </p>
              {benefits[0].badges && (
                <div className="flex flex-wrap gap-2">
                  {benefits[0].badges.map((badge, index) => (
                    <span key={index} className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Меньшие карточки */}
          <div className="space-y-6">
            {/* Экономично */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {benefits[1].icon}
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">
                {benefits[1].title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {benefits[1].description}
              </p>
            </div>

            {/* Сервис */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {benefits[2].icon}
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">
                {benefits[2].title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {benefits[2].description}
              </p>
            </div>
          </div>

          {/* Аккумулятор и Поддержка */}
          <div className="lg:col-span-1 lg:row-span-1 space-y-6">
            {/* Аккумулятор */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {benefits[3].icon}
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">
                {benefits[3].title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {benefits[3].description}
              </p>
            </div>

            {/* Поддержка */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {benefits[4].icon}
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">
                {benefits[4].title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {benefits[4].description}
              </p>
            </div>
          </div>
        </div>

        {/* Tablet: Главная карточка сверху + 2x2 */}
        <div className="hidden md:grid lg:hidden md:grid-cols-2 md:gap-6">
          {/* Главная карточка */}
          <div className="md:col-span-2 relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            {benefits[0].imageUrl && (
              <div className="relative h-64">
                <Image
                  src={benefits[0].imageUrl}
                  alt={benefits[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{benefits[0].icon}</span>
                <h3 className="text-2xl font-bold text-slate-100">
                  {benefits[0].title}
                </h3>
              </div>
              <p className="text-slate-300 mb-4 max-w-xl">
                {benefits[0].description}
              </p>
              {benefits[0].badges && (
                <div className="flex flex-wrap gap-2">
                  {benefits[0].badges.map((badge, index) => (
                    <span key={index} className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Остальные карточки 2x2 */}
          {benefits.slice(1).map((benefit, index) => (
            <div 
              key={index} 
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">
                {benefit.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile: Вертикальная сетка */}
        <div className="md:hidden space-y-6">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className={`relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 ${
                benefit.isMain ? 'p-6' : 'p-6'
              }`}
            >
              {benefit.isMain && benefit.imageUrl && (
                <div className="relative h-48 mb-4 -mx-6 -mt-6 rounded-t-3xl overflow-hidden">
                  <Image
                    src={benefit.imageUrl}
                    alt={benefit.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                </div>
              )}
              <div className={benefit.isMain ? '' : 'flex items-start gap-4'}>
                <div className={`text-4xl mb-4 group-hover:scale-110 transition-transform ${benefit.isMain ? '' : 'mt-1'}`}>
                  {benefit.icon}
                </div>
                <div className={benefit.isMain ? '' : 'flex-1'}>
                  <h3 className={`font-bold text-emerald-400 mb-3 ${benefit.isMain ? 'text-2xl' : 'text-xl'}`}>
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {benefit.description}
                  </p>
                  {benefit.badges && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {benefit.badges.map((badge, badgeIndex) => (
                        <span key={badgeIndex} className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                          ✓ {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
