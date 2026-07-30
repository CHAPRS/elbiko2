// src/app/constants.ts
import React from 'react';

export interface Bike {
  id: string; 
  name: string;
  model: string;
  power: string;
  maxSpeed: string;
  batteryLife: string;
  status: 'FREE' | 'MAINTENANCE' | 'RENTED';
  pricePerDay: number;
}

// ВОССТАНОВЛЕНО: Резервный массив на случай сбоя подключения к БД
export const MOCK_BIKES: Bike[] = [
  { id: 'mock-1', name: 'Monster PRO Amber', model: '2026 X', power: '500W', maxSpeed: 'до 55 км/ч', batteryLife: 'до 80 км', status: 'FREE', pricePerDay: 700 },
  { id: 'mock-2', name: 'Minako V8 PRO', model: '2025 Ultra', power: '400W', maxSpeed: 'до 45 км/ч', batteryLife: 'до 60 км', status: 'RENTED', pricePerDay: 500 },
  { id: 'mock-3', name: 'Kuga V1 Speed', model: 'Urban Light', power: '350W', maxSpeed: 'до 40 км/ч', batteryLife: 'до 50 км', status: 'FREE', pricePerDay: 450 }
];

export const ONBOARDING_STEPS = [
  { number: '01', title: 'Выбор модели', description: 'Ознакомьтесь с премиальным автопарком в каталоге и выберите подходящий электровелосипед под ваши задачи.' },
  { number: '02', title: 'Оформление заявки', description: 'Нажмите кнопку «Забронировать» и укажите свои контакты. Менеджер свяжется с вами в течение 5 минут.' },
  { number: '03', title: 'Быстрый старт', description: 'Заберите байк в точке выдачи или оформите доставку. Ключи, шлем и полная батарея уже готовы к поездке.' }
];

export const WHY_US_FEATURES = [
  { title: 'Без залога', description: 'Никаких скрытых платежей, заморозки средств на карте или крупных депозитов. Мы доверяем нашим клиентам и делаем премиальный прокат максимально доступным с первого дня.', badge: 'Доверие', gridClass: 'md:col-span-2 border border-slate-800 bg-slate-900/20 min-h-[400px]', icon: '🤝', imageUrl: '/images/no-deposit.jpg' },
  { title: 'Сервисное обслуживание', description: 'Полное technical обслуживание и регулярный осмотр электроники за наш счет. Если что-то пойдет не так — оперативно настроим или заменим байк.', gridClass: 'md:col-span-1 border border-slate-800 bg-slate-900/20 min-h-[400px]', icon: '🛠️', imageUrl: '/images/service.jpg' },
  { title: 'Новый велопарк', description: 'Все электровелосипеды в каталоге не старше одного сезона. Регулярно проходят полную диагностику и имеют максимальную емкость батарей.', badge: 'Премиум', gridClass: 'md:col-span-1 border border-slate-800 bg-slate-900/20 min-h-[400px]', icon: '⚡', imageUrl: '/images/fleet.jpg' },
  { title: 'Доставка к заказчику', description: 'Привезем полностью заряженный и настроенный под ваш рост электробайк прямо к вашему дому, офису или станции метро по предварительному согласованию в удобное время.', gridClass: 'md:col-span-2 border border-slate-800 bg-slate-900/20 min-h-[400px]', icon: '🚚', imageUrl: '/images/delivery.jpg' }
];

export const CLIENT_REVIEWS = [
  { name: 'Александр К.', date: '12 июня 2026', bike: 'Monster Monster', text: 'Брал Монстра на неделю для работы в курьерской доставке. Полного заряда хватает на весь день активной езды. Очень круто, что аренда без залога — оформили за 5 минут.', rating: 5 },
  { name: 'Дмитрий М.', date: '28 мая 2026', bike: 'Minako V12', text: 'Отличный сервис! Привезли чистый, полностью заряженный велосипед прямо к дому. Катался в удовольствие, электроника работает как часы. Обязательно буду обращаться ещё.', rating: 5 },
  { name: 'Илья С.', date: '15 мая 2026', bike: 'Wenbo Pro', text: 'Понравилось, что ремонт и обслуживание входят в стоимость. На третий день немного заскрипел тормоз — ребята за 10 минут всё исправили.', rating: 5 }
];

export const VK_TEAMS_SVG = React.createElement('svg', { viewBox: '0 0 24 24', className: 'w-5 h-5 fill-current' },
  React.createElement('path', { d: 'M23.45 5.5c.16-.54 0-.94-.77-.94h-2.55c-.65 0-.94.34-1.1.72 0 0-1.3 3.16-3.14 5.22-.6.6-.87.79-1.2.79-.16 0-.4-.19-.4-.73V5.5c0-.65-.19-.94-.75-.94h-4c-.4 0-.65.3-.65.59 0 .62.93.76 1.02 2.5V11c0 .82-.15.97-.48.97-.87 0-3-.3-4.27-3.21-.25-.6-.47-1.26-.64-1.89-.08-.34-.3-.57-.96-.57H1.3c-.74 0-.9.34-.9.72 0 .68.87 4.1 4.07 8.58C6.6 18.66 9.53 20 12.2 20c1.6 0 1.8-.36 1.8-.98v-2.29c0-.73.15-.88.66-.88.38 0 1.03.2 2.55 1.66C18.95 19.26 19.23 20 20.2 20h2.55c.74 0 1.1-.37.9-.1-2.42-3.13-2.54-3-2.54-3.53a1.53 1.53 0 0 1 1.25-1.23c.3-.12 3.14-5.14 3.14-5.14z' })
);

export const TELEGRAM_SVG = React.createElement('svg', { viewBox: '0 0 24 24', className: 'w-5 h-5 fill-current mr-0.5' },
  React.createElement('path', { d: 'M12 .587c-6.294 0-11.4 5.105-11.4 11.4s5.106 11.4 11.4 11.4 11.4-5.105 11.4-11.4-5.106-11.4-11.4-11.4zm5.419 8.243l-1.815 8.552c-.137.604-.495.753-1.002.468l-2.766-2.038-1.334 1.284c-.148.148-.272.272-.557.272l.199-2.819 5.132-4.636c.223-.198-.049-.308-.347-.11l-6.342 3.992-2.731-.853c-.594-.186-.606-.594.124-.879l10.669-4.113c.495-.181.928.115.77.88z' })
);

export const CONTACTS_BLOCK = React.createElement('div', {
  className: 'w-full rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-md p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6'
},
  React.createElement('div', { className: 'space-y-2 text-center md:text-left' },
    React.createElement('h3', { className: 'text-xl font-bold text-slate-100' }, 'Наш шоурум и точка выдачи'),
    React.createElement('p', { className: 'text-sm text-slate-400' }, 'Ежедневно с 09:00 до 21:00. Перед визитом желательно забронировать байк.'),
    React.createElement('p', { className: 'text-sm font-semibold text-amber-400' }, '📍 г. Москва, ул. Большая Дорогомиловская, д. 9')
  ),
  React.createElement('a', {
    href: 'https://yandex.ru',
    target: '_blank',
    rel: 'noopener noreferrer',
    className: 'inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium transition-all duration-300 hover:bg-amber-500 hover:text-slate-950 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] active:scale-95'
  }, '🗺️ Смотреть на Яндекс Картах')
);

export function getFeaturesUI() {
  const ui: any[] = [];
  WHY_US_FEATURES.forEach((f, i) => {
    const badge = f.badge ? React.createElement('span', { className: 'px-2.5 py-1 text-[10px] uppercase font-extrabold rounded-md bg-slate-950/80 text-amber-400 border border-amber-500/30 z-10 backdrop-blur-sm' }, f.badge) : null;
    const imgEl = f.imageUrl ? React.createElement('div', { className: 'absolute inset-0 w-full h-full z-0 overflow-hidden opacity-75 group-hover:opacity-85 transition-opacity duration-500' },
      React.createElement('img', { src: f.imageUrl, alt: f.title, className: 'w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700' }),
      React.createElement('div', { className: 'absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent' })
    ) : null;
    ui.push(React.createElement('div', { key: i, className: `relative group overflow-hidden rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-amber-400/40 p-6 ${f.gridClass}` },
      React.createElement('div', { className: 'relative z-10 flex flex-col h-full justify-between' },
        React.createElement('div', { className: 'flex items-center justify-between mb-4' }, React.createElement('div', { className: 'text-2xl w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center' }, f.icon), badge),
        React.createElement('div', { className: 'mt-auto bg-slate-950/50 p-3 rounded-xl backdrop-blur-[2px]' },
          React.createElement('h4', { className: 'text-xl font-bold text-white mb-2 group-hover:text-amber-400' }, f.title),
          React.createElement('p', { className: 'text-sm text-slate-200 leading-relaxed' }, f.description)
        )
      ), imgEl
    ));
  });
  return ui;
}

export function getStepsUI() {
  const ui: any[] = [];
  ONBOARDING_STEPS.forEach((s, i) => {
    ui.push(React.createElement('div', { key: i, className: 'relative z-10 group flex flex-col p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md transition-all duration-300 hover:border-amber-500/20 hover:bg-slate-900/60' },
      React.createElement('div', { className: 'text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-orange-600' }, s.number),
      React.createElement('h4', { className: 'text-lg font-bold text-slate-200 mb-2 group-hover:text-amber-400' }, s.title),
      React.createElement('p', { className: 'text-sm text-slate-400' }, s.description)
    ));
  });
  return ui;
}

export function getReviewsUI() {
  const ui: any[] = [];
  CLIENT_REVIEWS.forEach((rev, i) => {
    const stars = React.createElement('div', { className: 'flex gap-0.5 text-amber-400 text-sm mb-3' }, '★'.repeat(rev.rating));
    ui.push(React.createElement('div', { key: i, className: 'rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-6 flex flex-col justify-between hover:border-slate-700 transition-colors' },
      React.createElement('div', null,
        React.createElement('div', { className: 'flex justify-between items-start mb-1' }, React.createElement('h4', { className: 'font-bold text-slate-100' }, rev.name), React.createElement('span', { className: 'text-xs text-slate-500' }, rev.date)),
        React.createElement('div', { className: 'text-xs text-amber-500 font-medium mb-3 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 inline-block' }, `🚲 Аренда: ${rev.bike}`),
        React.createElement('p', { className: 'text-sm text-slate-300 leading-relaxed' }, rev.text)
      ),
      React.createElement('div', { className: 'mt-4 pt-4 border-t border-slate-800/60' }, stars)
    ));
  });
  return ui;
}
