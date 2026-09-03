'use client';
import React, { useEffect } from 'react';
import { CONTACTS } from '@/app/constants';

interface OrderModalProps {
  bike: any;
  onClose: () => void;
}

export default function OrderModal({ bike, onClose }: OrderModalProps) {

  // Блокируем скролл страницы при открытой модалке
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleContact = () => {
    if (CONTACTS.maxUrl) {
      window.open(CONTACTS.maxUrl, '_blank');
    } else {
      alert('Свяжитесь с нами по телефону: ' + CONTACTS.phoneDisplay);
    }
    onClose();
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

        <button 
          onClick={handleContact}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-slate-950 font-black rounded-xl text-center text-sm transition-all active:scale-98 shadow-lg"
        >
          Написать в MAX
        </button>
      </div>
    </div>
  );
}
