'use client';
import React from 'react';
import { useRentStore } from '@/store/useRentStore';

const businessFeatures = [
  {
    icon: '🏷',
    title: 'Логотип',
    description: 'Брендируем весь парк велосипедов под вашу компанию'
  },
  {
    icon: '🔧',
    title: 'Сервис',
    description: 'Техническое обслуживание парка — наша ответственность'
  },
  {
    icon: '👤',
    title: 'Курьеры',
    description: 'Поддержка и взаимодействие с курьерами полностью на нас'
  },
  {
    icon: '📊',
    title: 'Контроль',
    description: 'Управляем всеми процессами аренды от выдачи до возврата'
  }
];

export default function Business() {
  const { toggleContactModal } = useRentStore();

  const handleBusinessContact = () => {
    toggleContactModal(true, 'business');
  };

  return (
    <section id="business" className="py-20 px-4 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">
              Сотрудничество с юр. лицами
            </h2>
            <p className="text-slate-400 text-base mb-8 leading-relaxed">
              Обеспечиваем курьерские службы, доставки и логистические компании электровелосипедами под ключ. 
              Вы фокусируетесь на бизнесе — мы берём на себя всё остальное.
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span className="text-slate-300">Брендирование парка — наносим логотип вашей компании на велосипеды</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span className="text-slate-300">Контроль и отчётность — полная прозрачность процессов аренды</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span className="text-slate-300">Поддержка курьеров — решаем все вопросы напрямую</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <span className="text-slate-300">Гибкие условия — индивидуальный договор и корпоративные ставки</span>
              </li>
            </ul>
            
            <button 
              onClick={handleBusinessContact}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
            >
              Обсудить сотрудничество
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {businessFeatures.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm text-center transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-800/80"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-emerald-400 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}