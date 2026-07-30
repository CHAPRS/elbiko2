import React from 'react';

const benefits = [
  { title: '⚡ Зарядка в подарок', desc: 'Второй аккумулятор или быстрая зарядка всегда в комплекте.' },
  { title: '🛠️ Ремонт за 2 часа', desc: 'Сломался на заказе? Приедем и заменим байк на новый бесплатно.' },
  { title: '🎒 Полная экипировка', desc: 'Шлем, держатель для смартфона и замок уже включены в стоимость.' },
];

export default function Features() {
  return (
    <section className="px-4 py-16 bg-slate-900">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold text-center text-slate-100 sm:text-4xl">Всё включено в аренду</h2>
        <div className="grid gap-6 mt-12 sm:grid-cols-3">
          {benefits.map((b, i) => (
            <div key={i} className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-yellow-400">{b.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
