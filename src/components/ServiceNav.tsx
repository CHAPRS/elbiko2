'use client';
import React from 'react';
import Link from 'next/link';

const services = [
  { key: 'yandex-eda', name: 'Яндекс Еда' },
  { key: 'samokat', name: 'Самокат' },
  { key: 'kuper', name: 'Купер' },
  { key: 'magnit', name: 'Магнит' },
  { key: 'pyaterochka', name: 'Пятерочка' },
];

export default function ServiceNav() {
  return (
    <section className="py-4 bg-slate-950 border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-slate-400 text-sm mb-3">Аренда электровелосипедов для курьеров:</p>
        <div className="flex flex-wrap gap-3">
          {services.map((service) => (
            <Link
              key={service.key}
              href={`/dlya-${service.key}`}
              className="px-3 py-1.5 text-sm rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30 transition"
            >
              {service.name}
            </Link>
          ))}
          <Link
            href="/"
            className="px-3 py-1.5 text-sm rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30 transition"
          >
            Главная
          </Link>
        </div>
      </div>
    </section>
  );
}
