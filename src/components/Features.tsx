import React from 'react';

const benefits = [
  { 
    icon: '⚡',
    title: 'Мощные АКБ',
    description: '2 аккумулятора от 30 до 45 Ah — меняй и не останавливай смену. Зарядные станции в комплекте.'
  },
  { 
    icon: '🔧',
    title: 'Надёжная техника',
    description: 'Все велосипеды проходят техосмотр перед выдачей. Работает в любую погоду — доставки не останавливаются.'
  },
  { 
    icon: '📝',
    title: 'Гибкий договор',
    description: 'Аренда от одной недели. Продли или верни велосипед в любое время — без штрафов и лишних вопросов.'
  },
  { 
    icon: '💬',
    title: 'Поддержка по связи',
    description: 'Вопросы по аренде и технике — отвечаем в мессенджерах и по телефону в рабочее время.'
  },
  { 
    icon: '🚀',
    title: 'Премиум для долгих смен',
    description: 'Эргономичное седло, отличный свет и все необходимы световые индикаторы, амортизаторы и бортовой дисплей.'
  },
  { 
    icon: '📍',
    title: 'Одна точка в Оренбурге',
    description: 'Выдача, возврат и технические вопросы — всё по одному адресу: г. Оренбург, ул. Салмышская, д30. Удобно и без лишних поездок.'
  }
];

export default function Features() {
  return (
    <section id="advantages" className="py-20 px-4 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">
            Преимущества аренды электровелосипеда ЭльБайко
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Никакого бензина, пробок и штрафов за парковку. Сервис и справочная поддержка.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-800/80 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-3">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
