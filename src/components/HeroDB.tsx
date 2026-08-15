import React from 'react'
import Image from 'next/image'

interface HeroData {
  title: string
  subtitle?: string
  badge?: string
  backgroundImageUrl?: string
  bikeImageUrl?: string
  phone?: string
  telegramUrl?: string
  maksUrl?: string
  stat1Label?: string
  stat1Value?: string
  stat2Label?: string
  stat2Value?: string
  stat3Label?: string
  stat3Value?: string
  ctaText?: string
  ctaLink?: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
}

interface HeroDBProps {
  data: HeroData
}

export default function HeroDB({ data }: HeroDBProps) {
  if (!data) return null

  const bgImage = data.backgroundImageUrl || '/images/delivery.jpg'
  const bikeImage = data.bikeImageUrl || '/images/w720h405fill.jpg'
  const phone = data.phone || '+7 (987) 847-92-89'
  const telegramUrl = data.telegramUrl || 'https://t.me/your_telegram'
  const maksUrl = data.maksUrl || 'https://maks.com/your_profile'

  return (
    <section className="relative flex flex-col lg:flex-row items-center justify-center px-4 py-20 lg:py-32 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Фоновое изображение */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="ЭльБайко - аренда электровелосипедов"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950" />
      </div>

      <div className="absolute top-4 left-4 bg-emerald-500/20 text-emerald-400 font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-emerald-500/30 z-10">
        {data.badge}
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Фото велосипеда (слева) */}
        <div className="relative h-80 sm:h-96 lg:h-auto min-h-[400px] order-2 lg:order-1 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/10 bg-slate-800">
          <Image
            src={bikeImage}
            alt="Электровелосипед для курьеров"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Текст справа */}
        <div className="space-y-8 text-left order-1 lg:order-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            {data.title}
          </h1>

          {data.subtitle && (
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl">
              {data.subtitle}
            </p>
          )}
          
          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-lg pt-4">
            {data.stat1Label && data.stat1Value && (
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">{data.stat1Label}</div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">{data.stat1Value}</div>
              </div>
            )}
            {data.stat2Label && data.stat2Value && (
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-black text-cyan-400">{data.stat2Label}</div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">{data.stat2Value}</div>
              </div>
            )}
            {data.stat3Label && data.stat3Value && (
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">{data.stat3Label}</div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">{data.stat3Value}</div>
              </div>
            )}
          </div>

          {/* Основные кнопки */}
          <div className="flex flex-col sm:flex-row gap-4">
            {data.ctaText && data.ctaLink && (
              <a
                href={data.ctaLink}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
              >
                {data.ctaText}
              </a>
            )}
            {data.secondaryCtaText && data.secondaryCtaLink && (
              <a
                href={data.secondaryCtaLink}
                className="px-8 py-4 bg-slate-800/50 border border-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 transition-all duration-300 backdrop-blur-sm"
              >
                {data.secondaryCtaText}
              </a>
            )}
          </div>

          {/* Контакты */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-all hover:bg-slate-800 hover:border-emerald-500/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Позвонить
            </a>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold rounded-xl transition-all hover:bg-blue-500/30 hover:border-blue-500/50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
              Telegram
            </a>
            <a
              href={maksUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 font-semibold rounded-xl transition-all hover:bg-purple-500/30 hover:border-purple-500/50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Maks
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
