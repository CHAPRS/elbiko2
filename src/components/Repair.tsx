'use client';
import React from 'react';
import { useRentStore } from '@/store/useRentStore';

const repairServices = [
  {
    icon: '⚡',
    title: 'Электровелосипеды',
    description: 'Диагностика, ремонт электроники, замена аккумуляторов'
  },
  {
    icon: '🛴',
    title: 'Электросамокаты',
    description: 'Ремонт двигателей, контроллеров, тормозных систем'
  },
  {
    icon: '🏍️',
    title: 'Квадроциклы',
    description: 'Полное техническое обслуживание и ремонт'
  },
  {
    icon: '🔧',
    title: 'Другой электротранспорт',
    description: 'Ремонт любых видов электротранспорта'
  }
];

export default function Repair() {
  const { toggleContactModal } = useRentStore();

  const handleRepairContact = () => {
    toggleContactModal(true, 'repair');
  };

  return (
    <section id="repair" className="py-20 px-4 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-100 mb-4">
            Ремонт электросамокатов и электровелосипедов в Красноярске
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Чиним электровелосипеды, самокаты, квадроциклы и другой электротранспорт. Быстро, профессионально, по делу.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {repairServices.map((service, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm text-center transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-900/80 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold text-emerald-400 mb-2">{service.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
        
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-center">
          <h3 className="text-2xl font-bold text-slate-100 mb-4">
            Нужен ремонт электротранспорта?
          </h3>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto">
            Оставьте заявку, и мы свяжемся с вами для диагностики и расчёта стоимости ремонта
          </p>
          <button 
            onClick={handleRepairContact}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
          >
            Оставить заявку на ремонт
          </button>
        </div>
      </div>
    </section>
  );
}