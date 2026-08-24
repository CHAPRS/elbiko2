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
    <section id="advantages" className="py-12 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
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
        <div className="hidden lg:grid lg:grid-cols-2 lg:grid-rows-2 lg:gap-6">
          {/* Карточка "Готов к работе" - занимает 1 колонку и 2 ряда (слева, большая) */}
          <div className="lg:col-span-1 lg:row-span-2 relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            {benefits[0].imageUrl && (
              <div className="relative h-48">
                <Image
                  src={benefits[0].imageUrl}
                  alt={benefits[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{benefits[0].icon}</span>
                <h3 className="text-2xl font-bold text-slate-100">
                  {benefits[0].title}
                </h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
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

          {/* Три карточки справа */}
          <div className="space-y-4">
            {benefits.slice(1, 4).map((benefit, index) => (
              <div
                key={index}
                className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-emerald-500/30 transition-all duration-300 group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-emerald-400 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* Последняя карточка слева внизу */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
              {benefits[4].icon}
            </div>
            <h3 className="text-lg font-bold text-emerald-400 mb-2">
              {benefits[4].title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {benefits[4].description}
            </p>
          </div>


        </div>

        {/* Tablet: Главная карточка сверху + остальные */}
        <div className="hidden md:grid lg:hidden md:grid-cols-2 md:gap-5">
          {/* Главная карточка */}
          <div className="md:col-span-2 relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            {benefits[0].imageUrl && (
              <div className="relative h-36">
                <Image
                  src={benefits[0].imageUrl}
                  alt={benefits[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{benefits[0].icon}</span>
                <h3 className="text-xl font-bold text-slate-100">
                  {benefits[0].title}
                </h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-2">
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

          {/* Остальные карточки */}
          {benefits.slice(1).map((benefit, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-emerald-500/30 transition-all duration-300 group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-bold text-emerald-400 mb-2">
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
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 ${
                index === 0 ? '' : 'p-4'
              }`}
            >
              {index === 0 && benefit.imageUrl && (
                <div className="relative h-28">
                  <Image
                    src={benefit.imageUrl}
                    alt={benefit.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                </div>
              )}
              <div className={index === 0 ? 'p-4' : ''}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{benefit.icon}</span>
                  <h3 className={`font-bold ${index === 0 ? 'text-base text-slate-100' : 'text-base text-emerald-400'}`}>
                    {benefit.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
                {benefit.badges && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {benefit.badges.map((badge, badgeIndex) => (
                      <span key={badgeIndex} className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full">
                        ✓ {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
