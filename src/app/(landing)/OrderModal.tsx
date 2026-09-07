'use client';
import React, { useEffect, useState } from 'react';

interface OrderModalProps {
  bike: any;
  onClose: () => void;
}

export default function OrderModal({ bike, onClose }: OrderModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Блокируем скролл страницы при открытой модалке
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

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
          bikeId: bike?.id ?? null,
          bikeName: bike?.name ?? null,
          message: message.trim() || 'Заявка на аренду',
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
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-black text-white mb-2">Заявка отправлена</h3>
          <p className="text-sm text-slate-400 mb-6">
            Спасибо, {name}! Мы получили вашу заявку на {bike?.name} и свяжемся с вами в ближайшее время.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black rounded-xl text-center text-sm transition-all active:scale-98"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

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
        <p className="text-xs text-slate-400 mb-6">
          Вы выбрали: <span className="text-yellow-400 font-bold">{bike?.name}{bike?.model ? ` (${bike.model})` : ''}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-slate-950 font-black rounded-xl text-center text-sm transition-all active:scale-98 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
