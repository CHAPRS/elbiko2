import React from 'react'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'

interface TariffData {
  name: string
  subtitle?: string
  price: number
  period: string
  features?: string[]
  popular?: boolean
  order?: number
  image?: any
}

interface TariffsSanityProps {
  tariffs: TariffData[]
}

export default function TariffsSanity({ tariffs }: TariffsSanityProps) {
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
        {tariffs.map((tariff) => {
          const popularClass = tariff.popular
            ? 'bg-gradient-to-b from-emerald-950/50 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          
          const buttonClass = tariff.popular
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
            : 'bg-slate-800 text-white hover:bg-slate-700'

          return (
            <div
              key={tariff.order || tariff.name}
              className={`relative rounded-3xl p-8 border transition-all duration-300 ${popularClass}`}
            >
              {tariff.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold rounded-full">
                  Популярный
                </div>
              )}

              {tariff.image && (
                <div className="relative h-48 mb-6 rounded-2xl overflow-hidden">
                  <Image
                    src={urlFor(tariff.image).url()}
                    alt={tariff.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{tariff.name}</h3>
                {tariff.subtitle && (
                  <p className="text-sm text-slate-400">{tariff.subtitle}</p>
                )}
              </div>

              <div className="text-center mb-6">
                <div className="text-4xl font-black text-white">
                  {tariff.price.toLocaleString()} {tariff.period}
                </div>
              </div>

              {tariff.features && tariff.features.length > 0 && (
                <ul className="space-y-3 mb-6">
                  {tariff.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <button className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${buttonClass}`}>
                Выбрать тариф
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
