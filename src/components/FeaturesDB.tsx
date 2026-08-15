import React from 'react'
import Image from 'next/image'

interface FeatureData {
  icon?: string
  imageUrl?: string
  title: string
  description: string
  order?: number
}

interface FeaturesDBProps {
  features: FeatureData[]
}

export default function FeaturesDB({ features }: FeaturesDBProps) {
  if (!features || features.length === 0) return null

  return (
    <section id="advantages" className="py-20 px-4 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">
            Преимущества аренды электровелосипеда ЭльБайко
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Никакого бензина, пробок и штрафов за парковку. Сервис и справочная поддержка.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.order || index}
              className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-800/80 group"
            >
              {feature.imageUrl ? (
                <div className="relative h-32 mb-4 rounded-xl overflow-hidden">
                  <Image
                    src={feature.imageUrl}
                    alt={feature.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
              )}
              <h3 className="text-xl font-bold text-emerald-400 mb-3">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
