'use client';
import React from 'react'
import Image from 'next/image'

interface FeatureData {
  icon?: string
  imageUrl?: string
  title: string
  description: string
  order?: number
  isMain?: boolean
  badges?: string[]
}

interface FeaturesDBProps {
  features: FeatureData[]
}

export default function FeaturesDB({ features }: FeaturesDBProps) {
  if (!features || features.length === 0) return null

  // Сортируем по полю order
  const sortedFeatures = [...features].sort((a, b) => (a.order || 0) - (b.order || 0))

  // Первое преимущество - главное, остальные - второстепенные
  const mainFeature = sortedFeatures[0]
  const secondaryFeatures = sortedFeatures.slice(1)

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
        <div className="hidden lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:gap-6">
          {/* Компактная карточка "Готов к работе" - занимает 1 колонку и 1 ряд */}
          <div className="lg:col-span-1 lg:row-span-1 relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            {mainFeature.imageUrl && (
              <div className="relative h-32">
                <Image
                  src={mainFeature.imageUrl}
                  alt={mainFeature.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {mainFeature.icon && <span className="text-2xl">{mainFeature.icon}</span>}
                <h3 className="text-lg font-bold text-slate-100">
                  {mainFeature.title}
                </h3>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed mb-2">
                {mainFeature.description}
              </p>
              {mainFeature.badges && mainFeature.badges.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {mainFeature.badges.map((badge, index) => (
                    <span key={index} className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full">
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Остальные карточки */}
          {secondaryFeatures.map((feature, index) => (
            <div
              key={feature.order || index}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-emerald-500/30 transition-all duration-300 group"
            >
              {feature.icon && (
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
              )}
              <h3 className="text-lg font-bold text-emerald-400 mb-2">
                {feature.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}


        </div>

        {/* Tablet: Все карточки равные */}
        <div className="hidden md:grid lg:hidden md:grid-cols-2 md:gap-5">
          {sortedFeatures.map((feature, index) => (
            <div
              key={feature.order || index}
              className={`relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 ${
                index === 0 ? '' : 'p-5'
              }`}
            >
              {index === 0 && feature.imageUrl && (
                <div className="relative h-28">
                  <Image
                    src={feature.imageUrl}
                    alt={feature.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                </div>
              )}
              <div className={index === 0 ? 'p-4' : ''}>
                <div className="flex items-center gap-2 mb-2">
                  {feature.icon && <span className="text-2xl">{feature.icon}</span>}
                  <h3 className={`font-bold ${index === 0 ? 'text-lg text-slate-100' : 'text-lg text-emerald-400'}`}>
                    {feature.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
                {feature.badges && feature.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {feature.badges.map((badge, badgeIndex) => (
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

        {/* Mobile: Вертикальная сетка */}
        <div className="md:hidden space-y-3">
          {sortedFeatures.map((feature, index) => (
            <div
              key={feature.order || index}
              className={`relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 ${
                index === 0 ? '' : 'p-4'
              }`}
            >
              {index === 0 && feature.imageUrl && (
                <div className="relative h-24">
                  <Image
                    src={feature.imageUrl}
                    alt={feature.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                </div>
              )}
              <div className={index === 0 ? 'p-4' : ''}>
                <div className="flex items-center gap-2 mb-2">
                  {feature.icon && <span className="text-xl">{feature.icon}</span>}
                  <h3 className={`font-bold ${index === 0 ? 'text-base text-slate-100' : 'text-base text-emerald-400'}`}>
                    {feature.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
                {feature.badges && feature.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {feature.badges.map((badge, badgeIndex) => (
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
  )
}
