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
            {mainFeature.imageUrl && (
              <div className="relative h-64 lg:h-full">
                <Image
                  src={mainFeature.imageUrl}
                  alt={mainFeature.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                {mainFeature.icon && <span className="text-4xl">{mainFeature.icon}</span>}
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-100">
                  {mainFeature.title}
                </h3>
              </div>
              <p className="text-slate-300 mb-6 max-w-xl">
                {mainFeature.description}
              </p>
              {mainFeature.badges && mainFeature.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mainFeature.badges.map((badge, index) => (
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
            {secondaryFeatures.slice(0, 2).map((feature, index) => (
              <div 
                key={feature.order || index}
                className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 group"
              >
                {feature.icon && (
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                )}
                <h3 className="text-xl font-bold text-emerald-400 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Последние карточки */}
          <div className="lg:col-span-1 lg:row-span-1 space-y-6">
            {secondaryFeatures.slice(2).map((feature, index) => (
              <div 
                key={feature.order || index + 2}
                className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 group"
              >
                {feature.icon && (
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                )}
                <h3 className="text-xl font-bold text-emerald-400 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tablet: Главная карточка сверху + 2x2 */}
        <div className="hidden md:grid lg:hidden md:grid-cols-2 md:gap-6">
          {/* Главная карточка */}
          <div className="md:col-span-2 relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            {mainFeature.imageUrl && (
              <div className="relative h-64">
                <Image
                  src={mainFeature.imageUrl}
                  alt={mainFeature.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3 mb-4">
                {mainFeature.icon && <span className="text-4xl">{mainFeature.icon}</span>}
                <h3 className="text-2xl font-bold text-slate-100">
                  {mainFeature.title}
                </h3>
              </div>
              <p className="text-slate-300 mb-4 max-w-xl">
                {mainFeature.description}
              </p>
              {mainFeature.badges && mainFeature.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mainFeature.badges.map((badge, index) => (
                    <span key={index} className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Остальные карточки 2x2 */}
          {secondaryFeatures.map((feature, index) => (
            <div 
              key={feature.order || index}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 group"
            >
              {feature.icon && (
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
              )}
              <h3 className="text-xl font-bold text-emerald-400 mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile: Вертикальная сетка */}
        <div className="md:hidden space-y-6">
          {sortedFeatures.map((feature, index) => (
            <div 
              key={feature.order || index}
              className={`relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 ${
                index === 0 ? 'p-6' : 'p-6'
              }`}
            >
              {index === 0 && feature.imageUrl && (
                <div className="relative h-48 mb-4 -mx-6 -mt-6 rounded-t-3xl overflow-hidden">
                  <Image
                    src={feature.imageUrl}
                    alt={feature.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                </div>
              )}
              <div className={index === 0 ? '' : 'flex items-start gap-4'}>
                {feature.icon && (
                  <div className={`text-4xl mb-4 group-hover:scale-110 transition-transform ${index === 0 ? '' : 'mt-1'}`}>
                    {feature.icon}
                  </div>
                )}
                <div className={index === 0 ? '' : 'flex-1'}>
                  <h3 className={`font-bold text-emerald-400 mb-3 ${index === 0 ? 'text-2xl' : 'text-xl'}`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.badges && feature.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {feature.badges.map((badge, badgeIndex) => (
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
  )
}
