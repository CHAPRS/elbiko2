'use client';
import React from 'react';
import BikeCard from '@/app/(landing)/BikeCard';

interface CompactCatalogProps {
  bikes: any[];
  onBook: (bike: any) => void;
}

export default function CompactCatalog({ bikes, onBook }: CompactCatalogProps) {
  // Скрываем City Courier 48V и убираем дубли по названию,
  // чтобы всегда было две разные модели (например, U1 Pro и U6 PRO).
  const uniqueBikes = new Map<string, any>();
  const sortedBikes = [...bikes].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

  for (const bike of sortedBikes) {
    if (bike.name?.toLowerCase().includes('city courier 48v')) continue;
    const key = bike.name?.toLowerCase().trim() ?? String(bike.id);
    if (!uniqueBikes.has(key)) {
      uniqueBikes.set(key, bike);
    }
  }

  const displayBikes = Array.from(uniqueBikes.values()).slice(0, 2);

  const bikesRenderList = displayBikes.map((bike) => (
    <BikeCard key={bike.id} bike={bike} onBook={onBook} />
  ));

  const catalogLoadingText = (
    <div className="col-span-full p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-slate-500 font-mono text-sm">
      Загрузка актуального автопарка Elbiko...
    </div>
  );

  return (
    <section id="catalog" className="py-10 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Доступные модели в вашем городе</h2>
          <p className="text-sm text-slate-500 mt-2">Выберите электровелосипед для работы курьером</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {displayBikes.length === 0 ? catalogLoadingText : bikesRenderList}
        </div>
      </div>
    </section>
  );
}
