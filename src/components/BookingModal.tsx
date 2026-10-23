'use client';
import React, { useEffect, useState } from 'react';
import { useRentStore } from '@/store/useRentStore';

export function BookingModal() {
  const {
    selectedBike,
    rentDays,
    isBookingModalOpen,
    toggleBookingModal,
    userPhone,
  } = useRentStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(userPhone || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
  const calculatedTotal = rentDays * currentPricePerDay;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      alert('Пожалуйста, введите имя и телефон');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          bikeId: selectedBike?.id ?? null,
          bikeName: selectedBike?.name ?? null,
          message: message.trim() || 'Заявка на аренду через калькулятор',
          rentDays,
          totalPrice: calculatedTotal,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка отправки');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Ошибка при отправке заявки:', err);
      alert('Не удалось отправить заявку: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        onClick={() => toggleBookingModal(false)}
      >
        <div
          className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 p-8 rounded-3xl shadow-2xl shadow-slate-950 relative overflow-hidden backdrop-blur-xl text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-2xl font-black text-white tracking-tight mb-2">Заявка отправлена</h3>
          <p className="text-sm text-slate-400 mb-6">
            Спасибо, {name}! Мы получили вашу заявку на {selectedBike.name} и свяжемся с вами в ближайшее время.
          </p>
          <button
            onClick={() => toggleBookingModal(false)}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black rounded-xl text-center text-sm transition-all active:scale-98"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={() => toggleBookingModal(false)}
    >
      <div
        className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 p-8 rounded-3xl shadow-2xl shadow-slate-950 relative overflow-hidden backdrop-blur-xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
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
            <span className="text-3xl font-black tracking-tight text-yellow-400">{calculatedTotal.toLocaleString()} ₽</span>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Ваше имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (900) 000-00-00"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Комментарий (необязательно)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Удобное время связи или вопрос"
              rows={3}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-slate-950 font-black rounded-xl text-center text-base tracking-wide shadow-lg shadow-purple-500/10 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Отправка...' : 'Арендовать'}
          </button>

          <p className="text-xs text-slate-500 text-center">
            После отправки заявка придёт в Telegram-чат менеджерам.
          </p>
        </form>
      </div>
    </div>
  );
}
