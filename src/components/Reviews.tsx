'use client';
import React from 'react';

const reviews = [
  {
    rating: 5,
    text: 'Пересел с обычного велика на ЭльБайко — теперь успеваю в 1.5 раза больше заказов за смену. Батарея на весь день, не жалуюсь. Брал стандарт — оптимально.',
    author: 'Алексей М.',
    platform: 'Яндекс Еда',
    duration: '20 августа 2026г'
  },
  {
    rating: 5,
    text: 'Взял Премиум — работаю по 12 часов в день. Седло реально удобное, спина не болит. Раньше платил за бензин 7–8 тысяч в неделю, теперь 3 700 — и доход выше.',
    author: 'Дмитрий К.',
    platform: 'Купер',
    duration: '5 месяцев'
  },
  {
    rating: 4,
    text: 'Хорошая техника, выдают быстро. Рекомендую брать Стандарт — двух батарей хватает на полный день без проблем. Всё по-честному, никаких скрытых условий.',
    author: 'Иван С.',
    platform: 'Самокат',
    duration: '2 месяца'
  }
];

export default function Reviews() {
  return (
    <section id="reviews" className="py-20 px-4 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">
            Отзывы курьеров об аренде электровелосипедов
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div 
              key={index}
              className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-800/80"
            >
              <div className="flex items-center gap-1 text-emerald-400 mb-4">
                {'★'.repeat(review.rating)}
                {review.rating < 5 && '☆'.repeat(5 - review.rating)}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                &laquo;{review.text}&raquo;
              </p>
              <div className="border-t border-slate-700/50 pt-4">
                <div className="font-bold text-slate-100">{review.author}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {review.platform} · {review.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}