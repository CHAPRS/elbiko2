'use client';
import React, { useState } from 'react';
import { Bike } from '@/types';

interface OrderModalProps {
  bike: Bike;
  onClose: () => void;
}

export default function OrderModal({ bike, onClose }: OrderModalProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          bikeId: bike.id,
          bikeName: bike.name,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Не удалось отправить заявку');
        return;
      }

      setSent(true);
    } catch (err) {
      console.error('Ошибка при отправке заявки:', err);
      setError('Нет связи с сервером, попробуйте позже');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          ✕
        </button>

        <h3 className="text-xl font-black text-white mb-2">Бронирование байка</h3>
        <p className="text-xs text-slate-400 mb-6"> Вы выбрали: <span className="text-yellow-400 font-bold">{bike.name}</span></p>

        {sent ? (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm text-emerald-300">
              Заявка на <span className="font-bold">{bike.name}</span> принята. Менеджер свяжется с вами
              по номеру <span className="font-mono">{phone}</span>.
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black rounded-xl text-sm transition-all active:scale-98 shadow-lg"
            >
              Закрыть
            </button>
          </div>
        ) : (
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

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                {error}
              </div>
            )}

            <button 
              type="submit" disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black rounded-xl text-center text-sm transition-all active:scale-98 shadow-lg disabled:opacity-50"
            >
              {submitting ? 'Отправка заявки...' : 'Отправить заявку на бронь'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
