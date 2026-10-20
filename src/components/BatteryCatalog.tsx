'use client';
import React from 'react';
import BatteryCard from '@/app/(landing)/BatteryCard';

interface BatteryCatalogProps {
  batteries: any[];
  onBook: (battery: any) => void;
}

export default function BatteryCatalog({ batteries, onBook }: BatteryCatalogProps) {
  // Одна карточка на модель: дедупликация по имени (нормализованному)
  const unique = new Map<string, any>();
  const sorted = [...batteries].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

  for (const b of sorted) {
    const key = b.name?.toLowerCase().trim() ?? String(b.id);
    if (!unique.has(key)) {
      unique.set(key, b);
    }
  }

  const items = Array.from(unique.values());

  return (
    <section id="batteries" className="py-10 px-4 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Аренда аккумуляторов</h2>
          <p className="text-sm text-slate-500 mt-2">
            Запасная батарея для вашего электровелосипеда — берите отдельно, без аренды байка
          </p>
        </div>
        {items.length === 0 ? null : (
          <div className="max-w-4xl mx-auto">
            <BatteryCard battery={items[0]} onBook={onBook} />
          </div>
        )}
      </div>
    </section>
  );
}
