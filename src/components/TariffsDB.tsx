import React from 'react'
import Image from 'next/image'
import { normalizeImageUrl, tariffFallbackImages } from '@/lib/image'

interface TariffData {
  id: number
  name: string
  subtitle?: string
  price: number
  period: string
  features: string[]
  popular?: boolean
  imageUrl?: string
  icon?: string
  order?: number
}

interface TariffsDBProps {
  tariffs: TariffData[]
}

export default function TariffsDB({ tariffs }: TariffsDBProps) {
  if (!tariffs || tariffs.length === 0) return null

  return (
    <section id="tariffs" className="max-w-7xl mx-auto px-6 py-20 scroll-mt-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
          Тарифы аренды
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Выберите оптимальный тариф для вашей работы
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tariffs.map((tariff, index) => {
          const popularClass = tariff.popular
            ? 'bg-gradient-to-b from-emerald-500/20 to-slate-900 border-emerald-500/50 shadow-xl shadow-emerald-500/20 transform hover:scale-105 hover:shadow-2xl'
            : 'bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 hover:shadow-xl transform hover:scale-105'
          
          const buttonClass = tariff.popular
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105'
            : 'bg-slate-800 text-white hover:bg-slate-700 hover:scale-105'

          return (
            <div
              key={tariff.id}
              className={`relative rounded-3xl p-8 border transition-all duration-300 ${popularClass}`}
            >
              {tariff.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/30 animate-pulse">
                  🔥 Популярный выбор
                </div>
              )}

              {/* Иконка тарифа */}
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">{tariff.icon || '🚲'}</div>
              </div>

              {(() => {
                const imageUrl = normalizeImageUrl(tariff.imageUrl) || tariffFallbackImages[index % tariffFallbackImages.length]
                return (
                  <div className="relative h-40 mb-6 rounded-2xl overflow-hidden bg-slate-950/50 border border-slate-800">
                    <Image
                      src={imageUrl}
                      alt={tariff.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )
              })()}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-white mb-2">{tariff.name}</h3>
                {tariff.subtitle && (
                  <p className="text-sm text-slate-400">{tariff.subtitle}</p>
                )}
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-emerald-400">{tariff.price.toLocaleString()}</span>
                  <span className="text-slate-400">₽ {tariff.period}</span>
                </div>
              </div>

              {tariff.features && tariff.features.length > 0 && (
                <ul className="space-y-3 mb-6">
                  {tariff.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="text-emerald-400 mt-0.5 text-lg">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <button className={`w-full py-4 rounded-xl font-bold transition-all duration-300 active:scale-95 ${buttonClass}`}>
                Выбрать тариф
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
