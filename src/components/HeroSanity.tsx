import React from 'react'
import { urlFor } from '@/lib/sanity'
import Image from 'next/image'

interface HeroData {
  backgroundImage?: any
  title: string
  subtitle?: string
  badge?: string
  stat1_label?: string
  stat1_value?: string
  stat2_label?: string
  stat2_value?: string
  stat3_label?: string
  stat3_value?: string
  cta_text?: string
  cta_link?: string
  secondary_cta_text?: string
  secondary_cta_link?: string
}

interface HeroSanityProps {
  data: HeroData
}

export default function HeroSanity({ data }: HeroSanityProps) {
  if (!data) return null

  const bgImage = data.backgroundImage 
    ? urlFor(data.backgroundImage).url() 
    : '/images/delivery.jpg'

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Фоновое изображение */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="ELBIKO - аренда электровелосипедов"
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
          {data.stat1_label && data.stat1_value && (
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                {data.stat1_label}
              </div>
              <div className="text-sm text-slate-400 mt-1">{data.stat1_value}</div>
            </div>
          )}
          {data.stat2_label && data.stat2_value && (
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-cyan-400">
                {data.stat2_label}
              </div>
              <div className="text-sm text-slate-400 mt-1">{data.stat2_value}</div>
            </div>
          )}
          {data.stat3_label && data.stat3_value && (
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                {data.stat3_label}
              </div>
              <div className="text-sm text-slate-400 mt-1">{data.stat3_value}</div>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {data.cta_text && data.cta_link && (
            <a
              href={data.cta_link}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
            >
              {data.cta_text}
            </a>
          )}
          {data.secondary_cta_text && data.secondary_cta_link && (
            <a
              href={data.secondary_cta_link}
              className="px-8 py-4 bg-slate-800/50 border border-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 transition-all duration-300 backdrop-blur-sm"
            >
              {data.secondary_cta_text}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
