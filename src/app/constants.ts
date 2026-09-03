import React from 'react';

// ==========================================
// 1. КОНТАКТЫ ELBIKO - ЕДИНАЯ КОНФИГУРАЦИЯ
// ==========================================

export const CONTACTS = {
  // Телефон
  phone: '+79867753030',
  phoneDisplay: '+7 (986) 775-30-30',

  // Адрес — единый источник правды
  city: 'Оренбург',
  address: 'Салмышская улица, 44',
  addressDisplay: 'Салмышская улица, 44, Оренбург',

  // Часы работы
  workHours: '10:00 — 18:00 ежедневно',

  // Telegram
  telegramBot: 'https://t.me/my_own_elbiko_bot',
  telegramManager: 'https://t.me/ElBaiko',

  // MAX (публичная ссылка профиля)
  maxPhone: '+79867753030',
  maxPhoneDisplay: '+7 (986) 775-30-30',
  maxUrl: 'https://max.ru/u/f9LHodD0cOIvfR5D3T5DSR5uA6Wb95xybkbzJy-30CpguEZ-UXZ2s1S9Vds',
};

// ==========================================
// 1.1. FEATURE FLAGS — УПРАВЛЕНИЕ ВИДИМОСТЬЮ СЕКЦИЙ
// ==========================================

// Временно скрывает направление ремонта с главной страницы.
// Когда запускаем ремонт — изменить false на true.
export const SHOW_REPAIR_SECTION = false;

// ==========================================
// 2. ИНТЕРФЕЙСЫ И ТИПЫ ДАННЫХ
// ==========================================

export interface Bike {
  id: number;
  name: string;
  status: 'FREE' | 'RENTED' | 'MAINTENANCE' | 'BLOCKED';
  speed: string;
  range: string;
  motor: string;
  isWaterproof: boolean;
  pricePerDay: number;
}

export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface Step {
  id: number;
  title: string;
  description: string;
}

export interface Review {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
}

// ==========================================
// 2. СТАТИЧЕСКИЕ МАССИВЫ (ДАННЫЕ ДЛЯ ЛЕНДИНГА)
// ==========================================

export const WHY_US_FEATURES: Feature[] = [
  {
    id: 1,
    title: 'Максимальный запас хода',
    description: 'Батареи повышенной емкости позволяют проезжать до 120 км на одном заряде. Работай всю смену без дозарядок.',
    icon: '🔋',
  },
  {
    id: 2,
    title: 'Аквазащита класса IP65',
    description: 'Все наши байки полностью гидроизолированы. Никаких замыканий и отказов в сильный дождь или снегопад.',
    icon: '🌧️',
  },
  {
    id: 3,
    title: 'Быстрый ремонт за 30 минут',
    description: 'Собственная сеть сервисных центров. Если что-то сломалось — заменим байк или починим на месте за полчаса.',
    icon: '🛠️',
  },
  {
    id: 4,
    title: 'Выгодные тарифы',
    description: 'Гибкая система оплаты и скидки при долгосрочной аренде. Честная цена без скрытых комиссий и залогов.',
    icon: '💰',
  },
];

export const ONBOARDING_STEPS: Step[] = [
  {
    id: 1,
    title: 'Оставь заявку',
    description: 'Заполни быструю форму на сайте или перейди в нашего Telegram-бота за 1 минуту.',
  },
  {
    id: 2,
    title: 'Подтверди профиль',
    description: 'Загрузи фото паспорта для быстрой автоматической проверки нашей службой безопасности.',
  },
  {
    id: 3,
    title: 'Забери свой байк',
    description: 'Приходи в ближайший пункт выдачи, получи заряженный велосипед, шлем и держи курс на заказы.',
  },
];

export const CLIENT_REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Алексей',
    role: 'Курьер Яндекс.Еда (опыт 2 года)',
    text: 'Раньше арендовал в другом месте, постоянно садилась батарея к середине дня. На Elbiko Pro спокойно катаю по 10 часов, и еще остается процентов 20. В ливень работают идеально!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Марат',
    role: 'Курьер Самокат',
    text: 'Сервис на высоте. На прошлой неделе проколол колесо на заказе, написал в поддержку — через 20 минут приехал мастер и выдал подменный велик. Не потерял ни копейки заработка.',
    rating: 5,
  },
];

// ==========================================
// 3. БЕЗОПАСНЫЕ ФУНКЦИИ РЕНДЕРИНГА (ОБХОД SWC БАГА)
// ==========================================

// Генерирует карточки преимуществ для главной страницы
export function getFeaturesUI(): React.ReactElement[] {
  const list: React.ReactElement[] = [];
  WHY_US_FEATURES.forEach((item) => {
    list.push(
      React.createElement('div', { key: item.id, className: 'p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-amber-500/30 transition-all backdrop-blur-sm' },
        React.createElement('div', { className: 'text-3xl mb-4' }, item.icon),
        React.createElement('h3', { className: 'text-xl font-bold text-slate-100 mb-2' }, item.title),
        React.createElement('p', { className: 'text-slate-400 text-sm leading-relaxed' }, item.description)
      )
    );
  });
  return list;
}

// Генерирует шаги онбординга для главной страницы
export function getStepsUI(): React.ReactElement[] {
  const list: React.ReactElement[] = [];
  ONBOARDING_STEPS.forEach((item) => {
    list.push(
      React.createElement('div', { key: item.id, className: 'relative p-6 bg-slate-900/30 border border-slate-800/60 rounded-2xl' },
        React.createElement('div', { className: 'absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center font-bold text-slate-950 shadow-lg' }, String(item.id)),
        React.createElement('h3', { className: 'text-lg font-bold text-slate-200 mt-2 mb-2' }, item.title),
        React.createElement('p', { className: 'text-slate-400 text-sm' }, item.description)
      )
    );
  });
  return list;
}

// Генерирует карточки отзывов для главной страницы
export function getReviewsUI(): React.ReactElement[] {
  const list: React.ReactElement[] = [];
  CLIENT_REVIEWS.forEach((item) => {
    list.push(
      React.createElement('div', { key: item.id, className: 'p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col justify-between' },
        React.createElement('div', null,
          React.createElement('div', { className: 'flex text-amber-500 mb-3 text-sm' }, '★'.repeat(item.rating)),
          React.createElement('p', { className: 'text-slate-300 italic text-sm leading-relaxed' }, `"${item.text}"`)
        ),
        React.createElement('div', { className: 'mt-6 pt-4 border-t border-slate-800/60' },
          React.createElement('h4', { className: 'font-bold text-slate-200 text-sm' }, item.name),
          React.createElement('p', { className: 'text-xs text-amber-500/80 mt-0.5' }, item.role)
        )
      )
    );
  });
  return list;
}

// Генерирует строки таблицы управления для админ-панели
export function getAdminBikesTableUI(
  bikes: Bike[], 
  onStatusChange: (id: number, nextStatus: string) => void
): React.ReactElement[] {
  const rows: React.ReactElement[] = [];

  bikes.forEach((bike) => {
    let statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (bike.status === 'RENTED') statusColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (bike.status === 'MAINTENANCE') statusColor = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    if (bike.status === 'BLOCKED') statusColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

    rows.push(
      React.createElement('tr', { key: bike.id, className: 'border-b border-slate-800 hover:bg-slate-900/50 transition-colors' },
        React.createElement('td', { className: 'p-4 font-mono text-slate-500 text-sm' }, `#${bike.id}`),
        React.createElement('td', { className: 'p-4 font-medium text-slate-200' }, bike.name),
        React.createElement('td', { className: 'p-4 text-slate-400 text-sm' }, `${bike.motor} / ${bike.speed}`),
        React.createElement('td', { className: 'p-4 text-slate-400 text-sm' }, bike.range),
        React.createElement('td', { className: 'p-4 text-slate-400 text-sm' }, bike.isWaterproof ? 'Да' : 'Нет'),
        React.createElement('td', { className: 'p-4 font-medium text-amber-500' }, `${bike.pricePerDay} ₽`),
        React.createElement('td', { className: 'p-4' }, 
          React.createElement('span', { className: `px-2 py-1 text-xs rounded-full border ${statusColor}` }, bike.status)
        ),
        React.createElement('td', { className: 'p-4 text-right' }, 
          React.createElement('div', { className: 'flex justify-end gap-2' },
            bike.status !== 'FREE' && React.createElement('button', {
              onClick: () => onStatusChange(bike.id, 'FREE'),
              className: 'px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors'
            }, 'Свободен'),
            bike.status !== 'MAINTENANCE' && React.createElement('button', {
              onClick: () => onStatusChange(bike.id, 'MAINTENANCE'),
              className: 'px-2 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors'
            }, 'Ремонт'),
            bike.status !== 'BLOCKED' && React.createElement('button', {
              onClick: () => onStatusChange(bike.id, 'BLOCKED'),
              className: 'px-2 py-1 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors'
            }, 'Блок')
          )
        )
      )
    );
  });

  return rows;
}
