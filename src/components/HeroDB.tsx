import React from 'react'
import Image from 'next/image'

interface HeroData {
  title: string
  subtitle?: string
  badge?: string
  backgroundImageUrl?: string
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

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Фоновое изображение */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="ЭльБайко - аренда электровелосипедов"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950" />
      </div>

      {/* Контент */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        {data.badge && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {data.badge}
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
          {data.title}
        </h1>

        {data.subtitle && (
          <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        )}

        {/* Статистика */}
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          {data.stat1Label && data.stat1Value && (
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                {data.stat1Label}
              </div>
              <div className="text-sm text-slate-400 mt-1">{data.stat1Value}</div>
            </div>
          )}
          {data.stat2Label && data.stat2Value && (
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-cyan-400">
                {data.stat2Label}
              </div>
              <div className="text-sm text-slate-400 mt-1">{data.stat2Value}</div>
            </div>
          )}
          {data.stat3Label && data.stat3Value && (
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                {data.stat3Label}
              </div>
              <div className="text-sm text-slate-400 mt-1">{data.stat3Value}</div>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
      </div>
    </section>
  )
}
