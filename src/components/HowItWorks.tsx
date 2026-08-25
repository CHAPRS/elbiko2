'use client';
import React from 'react';
import Image from 'next/image';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
  badges: string[] | null;
  imageUrl?: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Оставьте заявку',
    description: 'Заполните короткую форму на сайте и укажите удобный способ связи.',
    icon: '📱',
    badges: null,
    imageUrl: '/images/step-1.webp'
  },
  {
    number: '02',
    title: 'Мы свяжемся с вами',
    description: 'Уточним детали аренды, ответим на вопросы и поможем выбрать подходящий вариант.',
    icon: '📞',
    badges: null,
    imageUrl: '/images/step-2.webp'
  },
  {
    number: '03',
    title: 'Заберите готовый электровелосипед',
    description: 'Получите проверенный, заряженный и готовый к работе велосипед.',
    icon: '🚴',
    badges: null,
    imageUrl: '/images/step-3.webp'
  },
  {
    number: '04',
    title: 'Выходите на линию',
    description: 'Получите электровелосипед и можете начинать работать.',
    icon: '🚀',
    badges: null,
    imageUrl: '/images/step-4.webp'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">
            От заявки до первой доставки — несколько простых шагов
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Выбираете велосипед → оформляете аренду → получаете готовый к работе велосипед → выходите на линию
          </p>
        </div>

        {/* Desktop: Горизонтальный timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Маршрутная линия */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-emerald-500/30 transform -translate-y-1/2">
              {/* Точки на линии */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute top-1/2 w-3 h-3 bg-emerald-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-slate-950"
                  style={{ left: `${(i + 1) * 25}%` }}
                />
              ))}
            </div>

            {/* Этапы */}
            <div className="grid grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Название этапа вместо цифры */}
                  <div className="w-full h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-center text-sm mb-4 px-2">
                    {step.title}
                  </div>

                  {/* Все этапы - с изображениями */}
                  <div className="relative">
                    {step.imageUrl ? (
                      <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-slate-900/50 border border-slate-800">
                        <Image
                          src={step.imageUrl}
                          alt={step.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                      </div>
                    ) : (
                      <div className="text-4xl mb-4 text-center">
                        {step.icon}
                      </div>
                    )}
                    
                    {/* Badges */}
                    {step.badges && step.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {step.badges.map((badge, badgeIndex) => (
                          <span key={badgeIndex} className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                            ✓ {badge}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Вертикальный timeline */}
        <div className="lg:hidden">
          <div className="space-y-12 relative">
            {/* Вертикальная линия */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/30 via-cyan-500/30 to-emerald-500/30">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-emerald-500 rounded-full transform -translate-x-1/2 border-2 border-slate-950"
                  style={{ top: `${(i + 1) * 25}%` }}
                />
              ))}
            </div>

            {steps.map((step, index) => (
              <div key={index} className="relative pl-20">
                {/* Название этапа вместо цифры */}
                <div className="absolute left-0 w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-center text-xs px-2">
                  {step.title}
                </div>

                {/* Все этапы - с изображениями */}
                <div className="relative">
                  {step.imageUrl ? (
                    <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-slate-900/50 border border-slate-800">
                      <Image
                        src={step.imageUrl}
                        alt={step.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                    </div>
                  ) : (
                    <div className="text-4xl mb-4">
                      {step.icon}
                    </div>
                  )}
                  
                  {/* Badges */}
                  {step.badges && step.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {step.badges.map((badge, badgeIndex) => (
                        <span key={badgeIndex} className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                          ✓ {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA секция */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-100 mb-2">
            Готовы выйти на линию?
          </h3>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto">
            Выберите подходящий электровелосипед и оставьте заявку.
          </p>
          <a
            href="#catalog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl text-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-105 active:scale-95"
          >
            Выбрать электровелосипед
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4-4m4 4V12" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}