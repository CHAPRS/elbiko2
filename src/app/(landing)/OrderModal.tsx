'use client';
import React, { useState, useEffect } from 'react';

interface OrderModalProps {
  bike: any;
  onClose: () => void;
}

export default function OrderModal({ bike, onClose }: OrderModalProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Блокируем скролл страницы при открытой модалке
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Имитация отправки лида на бэкенд
    setTimeout(() => {
      alert(`Заявка на модель ${bike.name} успешно отправлена! Мы свяжемся с вами по номеру ${phone}.`);
      setSubmitting(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-slate-800/50 transition-colors"
          aria-label="Закрыть"
        >
          ✕
        </button>
        
        <h3 className="text-xl font-black text-white mb-2">Бронирование байка</h3>
        <p className="text-xs text-slate-400 mb-6"> Вы выбрали: <span className="text-yellow-400 font-bold">{bike.name} ({bike.model})</span></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Ваше имя</label>
            <input 
              type="text" required placeholder="Иван" value={name} onChange={e => setName(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-yellow-500 text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Телефон курьера</label>
            <input 
              type="tel" required placeholder="+7 (999) 000-00-00" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-yellow-500 text-white font-mono"
            />
          </div>
          <button 
            type="submit" disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black rounded-xl text-center text-sm transition-all active:scale-98 shadow-lg disabled:opacity-50"
          >
            {submitting ? 'Отправка заявки...' : 'Отправить заявку на бронь'}
          </button>
        </form>
      </div>
    </div>
  );
}
