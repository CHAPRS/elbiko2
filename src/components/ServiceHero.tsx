'use client';
import React from 'react';
import { CONTACTS } from '@/app/constants';

interface ServiceHeroProps {
  badge: string;
  h1: string;
  subtitle: string;
  price: string;
}

export default function ServiceHero({ badge, h1, subtitle, price }: ServiceHeroProps) {
  return (
    <section className="relative min-h-[85vh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh]">
          <div className="space-y-8 z-10 order-2 lg:order-1">
            <div className="inline-flex items-center bg-emerald-500/20 text-emerald-400 font-black px-4 py-2 rounded-full text-xs uppercase tracking-wider border border-emerald-500/30">
              {badge}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 leading-tight">
              {h1}
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed">
              {subtitle}
            </p>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-emerald-400">{price}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#catalog"
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl text-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 text-center"
              >
                Выбрать велосипед
              </a>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-slate-800/50 text-slate-200 font-bold rounded-xl text-lg transition-all border border-slate-700 hover:bg-slate-800 hover:scale-105 active:scale-95 text-center"
              >
                Как это работает
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { icon: '⚡', title: 'Выгодно', description: 'от 457 ₽/сут' },
                { icon: '📄', title: 'Быстро', description: 'Оформление за 5 минут' },
                { icon: '🔧', title: 'Сервис', description: 'Помощь с ремонтом' },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:bg-slate-900/70 transition-colors"
                >
                  <div className="text-2xl mb-2">{benefit.icon}</div>
                  <div className="text-sm font-bold text-slate-100">{benefit.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{benefit.description}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href={`tel:${CONTACTS.phone}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/50 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-all hover:bg-slate-800 hover:border-emerald-500/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Позвонить
              </a>
              <a
                href={CONTACTS.telegramManager}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold rounded-xl transition-all hover:bg-blue-500/30 hover:border-blue-500/50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                Telegram
              </a>
              <a
                href={CONTACTS.maxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 font-semibold rounded-xl transition-all hover:bg-purple-500/30 hover:border-purple-500/50"
              >
                <span className="w-5 h-5 flex items-center justify-center text-xs bg-purple-500/30 text-purple-300 rounded">MAX</span>
                Написать в MAX
              </a>
            </div>
          </div>

          <div className="relative h-[60vh] lg:h-[80vh] order-1 lg:order-2 flex items-start justify-center pt-12">
            <div className="relative w-full h-full max-w-3xl mx-auto flex items-start justify-center">
              <div className="relative w-full h-full">
                <img
                  src="/images/hero-bike-main.webp"
                  alt="Электровелосипед для аренды курьерам"
                  className="object-contain w-full h-full"
                  style={{
                    filter: 'drop-shadow(0 30px 60px rgba(16, 185, 129, 0.2))',
                    transform: 'scale(2.25)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
