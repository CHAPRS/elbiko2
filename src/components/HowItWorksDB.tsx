import React from 'react'
import Image from 'next/image'

interface StepData {
  number: string
  imageUrl?: string
  title: string
  description: string
  order?: number
}

interface HowItWorksDBProps {
  steps: StepData[]
}

export default function HowItWorksDB({ steps }: HowItWorksDBProps) {
  if (!steps || steps.length === 0) return null

  return (
    <section id="how-it-works" className="py-20 px-4 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">
            Как арендовать электровелосипед
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Выход на смену в день обращения за 15 минут
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.order || index} className="relative group">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-900/80">
                {step.imageUrl ? (
                  <div className="relative h-32 mb-4 rounded-xl overflow-hidden">
                    <Image
                      src={step.imageUrl}
                      alt={step.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-black flex items-center justify-center text-lg mb-4 group-hover:bg-emerald-500/20 transition-colors">
                    {step.number}
                  </div>
                )}
                <h3 className="text-lg font-bold text-slate-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Соединительные линии для десктопа */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
