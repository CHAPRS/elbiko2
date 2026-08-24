'use client';
import React from 'react';
import BikeCard from '@/app/(landing)/BikeCard';

interface CompactCatalogProps {
  bikes: any[];
  onBook: (bike: any) => void;
}

export default function CompactCatalog({ bikes, onBook }: CompactCatalogProps) {
  // Показать только первые 3 велосипеда для компактности
  const displayBikes = bikes.slice(0, 3);

  const bikesRenderList = displayBikes.map((bike) => (
    <BikeCard key={bike.id} bike={bike} onBook={onBook} />
  ));

  const catalogLoadingText = (
    <div className="col-span-full p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-slate-500 font-mono text-sm">
      Загрузка актуального автопарка Elbiko...
    </div>
  );

  return (
    <section id="catalog" className="py-12 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Доступные модели в вашем городе</h2>
          <p className="text-sm text-slate-500 mt-2">Выберите электровелосипед для работы курьером</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBikes.length === 0 ? catalogLoadingText : bikesRenderList}
        </div>
      </div>
    </section>
  );
}
