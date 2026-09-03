'use client';
import React, { useEffect } from 'react';
import { useRentStore } from '@/store/useRentStore';
import { CONTACTS } from '@/app/constants';

// Заменили export default на именованный экспорт для предотвращения ошибок импорта
export function BookingModal() {
  const { 
    selectedBike, 
    rentDays, 
    isAuthenticated, 
    isBookingModalOpen, 
    toggleBookingModal, 
    toggleAuthModal, 
    userPhone 
  } = useRentStore();

  // Блокируем скролл основной страницы при открытой модалке
  useEffect(() => {
    if (isBookingModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.pointerEvents = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.pointerEvents = 'auto';
    };
  }, [isBookingModalOpen]);

  if (!isBookingModalOpen || !selectedBike) return null;

  // Рассчитываем скидку на базе твоих условий
  const currentPricePerDay = rentDays >= 30 ? 400 : rentDays >= 14 ? 450 : selectedBike.pricePerDay;
  const totalPrice = rentDays * currentPricePerDay;

  const handleConfirm = () => {
    if (CONTACTS.maxUrl) {
      window.open(CONTACTS.maxUrl, '_blank');
    } else {
      alert('Свяжитесь с нами по телефону: ' + CONTACTS.phoneDisplay);
    }
    toggleBookingModal(false);
  };

  return (
    // Глубокое размытие заднего плана (backdrop-blur-md) для премиального вида
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={() => toggleBookingModal(false)} // Закрытие при клике на оверлей
    >
      <div 
        className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 p-8 rounded-3xl shadow-2xl shadow-slate-950 relative overflow-hidden backdrop-blur-xl animate-scale-up"
        onClick={(e) => e.stopPropagation()} // Защита от закрытия при клике внутри окна
      >
        {/* Декоративное неоновое свечение внутри модалки */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Кнопка закрытия */}
        <button 
          onClick={() => toggleBookingModal(false)} 
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>

        <h3 className="text-2xl font-black text-white tracking-tight">
          Подтверждение аренды
        </h3>
        <p className="text-sm text-slate-400 mt-1">Проверьте параметры вашего заказа</p>

        {/* Детали заказа */}
        <div className="mt-6 p-5 bg-slate-950/50 border border-slate-800/60 rounded-2xl space-y-3.5 text-sm text-slate-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Модель электровелосипеда</span>
            <span className="font-bold text-white text-base">{selectedBike.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Длительность</span>
            <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md text-xs">
              {rentDays} дней
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Тарифный план</span>
            <span className="font-bold text-slate-200">{currentPricePerDay} ₽ / сутки</span>
          </div>
          
          <div className="border-t border-slate-800/80 my-3 pt-4 flex justify-between items-baseline">
            <span className="font-bold text-white text-base">Итого к оплате</span>
            <span className="text-3xl font-black tracking-tight text-yellow-400">{totalPrice.toLocaleString()} ₽</span>
          </div>
        </div>

        {/* Предупреждение о подмене */}
        <div className="mt-4 flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-400">
          <span className="text-lg">🛠️</span>
          <span>Бесплатное техническое обслуживание и подменный электровелосипед включены в стоимость.</span>
        </div>

        {/* Главная кнопка действия */}
        <button 
          onClick={handleConfirm} 
          className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-slate-950 font-black rounded-xl text-center text-base tracking-wide shadow-lg shadow-purple-500/10 transition-all active:scale-98"
        >
          Написать в MAX
        </button>
      </div>
    </div>
  );
}
