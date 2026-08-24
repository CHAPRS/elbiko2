'use client';
import React from 'react';
import Image from 'next/image';

interface FeatureData {
  icon?: string;
  imageUrl?: string;
  title: string;
  description: string;
  order?: number;
  isMain?: boolean;
  badges?: string[];
}

interface FeaturesDBProps {
  features: FeatureData[];
}

export default function FeaturesDB({ features }: FeaturesDBProps) {
  if (!features || features.length === 0) return null;

  const sortedFeatures = [...features].sort((a, b) => (a.order || 0) - (b.order || 0));
  const mainFeature = sortedFeatures[0];
  const secondaryFeatures = sortedFeatures.slice(1);

  return (
    <section id="advantages" className="py-8 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1.5 bg-emerald-500/20 text-emerald-400 font-black text-xs uppercase tracking-wider rounded-full border border-emerald-500/30 mb-3">
            ПОЧЕМУ ЭльБайко
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 mb-2">
            Всё для работы курьером
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Всё необходимое для комфортной работы — в одной аренде.
          </p>
        </div>

        {/* Desktop: Bento Grid */}
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-4">
          {/* Главная карточка — 3 из 5 колонок, примерно 60% */}
          <div className="lg:col-span-3 relative h-[320px] bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            {mainFeature.imageUrl && (
              <Image
                src={mainFeature.imageUrl}
                alt={mainFeature.title}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="flex items-center gap-3 mb-2">
                {mainFeature.icon && <span className="text-3xl">{mainFeature.icon}</span>}
                <h3 className="text-2xl font-black text-slate-100">
                  {mainFeature.title}
                </h3>
              </div>
              <p className="text-slate-300 text-sm max-w-md mb-3">
                {mainFeature.description}
              </p>
              {mainFeature.badges && mainFeature.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mainFeature.badges.map((badge, index) => (
                    <span key={index} className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black rounded-full">
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4 карточки справа — 2×2 сетка */}
          <div className="lg:col-span-2 grid grid-cols-2 grid-rows-2 gap-4">
            {secondaryFeatures.map((feature, index) => (
              <div
                key={feature.order || index}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 hover:border-emerald-500/30 transition-all duration-300 group"
              >
                {feature.icon && (
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                )}
                <h3 className="text-base font-bold text-emerald-400 mb-1">
                  {feature.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tablet: Главная карточка сверху + 4 маленькие 2×2 */}
        <div className="hidden md:grid lg:hidden md:grid-cols-2 md:gap-4">
          <div className="md:col-span-2 relative h-64 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            {mainFeature.imageUrl && (
              <Image
                src={mainFeature.imageUrl}
                alt={mainFeature.title}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <div className="flex items-center gap-3 mb-2">
                {mainFeature.icon && <span className="text-2xl">{mainFeature.icon}</span>}
                <h3 className="text-xl font-black text-slate-100">
                  {mainFeature.title}
                </h3>
              </div>
              <p className="text-slate-300 text-sm max-w-lg mb-2">
                {mainFeature.description}
              </p>
              {mainFeature.badges && mainFeature.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mainFeature.badges.map((badge, index) => (
                    <span key={index} className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black rounded-full">
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {secondaryFeatures.map((feature, index) => (
            <div
              key={feature.order || index}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 hover:border-emerald-500/30 transition-all duration-300 group"
            >
              {feature.icon && (
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
              )}
              <h3 className="text-base font-bold text-emerald-400 mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile: Вертикальная сетка */}
        <div className="md:hidden space-y-3">
          {/* Главная карточка */}
          <div className="relative h-56 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            {mainFeature.imageUrl && (
              <Image
                src={mainFeature.imageUrl}
                alt={mainFeature.title}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <div className="flex items-center gap-2 mb-1">
                {mainFeature.icon && <span className="text-2xl">{mainFeature.icon}</span>}
                <h3 className="text-lg font-black text-slate-100">
                  {mainFeature.title}
                </h3>
              </div>
              <p className="text-slate-300 text-xs max-w-md mb-2">
                {mainFeature.description}
              </p>
              {mainFeature.badges && mainFeature.badges.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {mainFeature.badges.map((badge, index) => (
                    <span key={index} className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black rounded-full">
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4 маленькие карточки */}
          <div className="grid grid-cols-2 gap-3">
            {secondaryFeatures.map((feature, index) => (
              <div
                key={feature.order || index}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 hover:border-emerald-500/30 transition-all duration-300 group"
              >
                {feature.icon && (
                  <div className="text-xl mb-1.5 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                )}
                <h3 className="text-sm font-bold text-emerald-400 mb-0.5">
                  {feature.title}
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
