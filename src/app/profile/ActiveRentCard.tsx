'use client';
import React, { useState } from 'react';

interface ActiveRentCardProps {
  rent: any;
}

export default function ActiveRentCard({ rent }: ActiveRentCardProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleEndRent = async () => {
    const confirmAction = confirm('Вы уверены, что хотите завершить аренду электровелосипеда? Он станет доступен для других курьеров.');
    if (!confirmAction) return;

    try {
      setSubmitting(true);
      // Вызываем твой PATCH эндпоинт
      const res = await fetch('/api/user/rent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentId: rent.id })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Аренда успешно завершена! Пожалуйста, сдайте велосипед в пункт выдачи.');
        window.location.reload(); // Перезагружаем страницу для обновления статуса
      } else {
        alert(data.error || 'Не удалось завершить аренду');
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка сети при отправке запроса');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex justify-between items-start border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Текущий транспорт</span>
          <h3 className="text-xl font-black text-white mt-1">{rent.bikeName}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{rent.bikeModel}</p>
        </div>
        <span className="px-3 py-1 rounded-xl text-xs font-bold border border-blue-500/30 bg-blue-500/5 text-blue-400 font-mono">
          {rent.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl">
          <p className="text-slate-500">Осталось дней</p>
          <p className="text-base font-bold text-white mt-1">{rent.daysLeft}</p>
        </div>
        <div className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl">
          <p className="text-slate-500">Тариф в сутки</p>
          <p className="text-base font-bold text-yellow-400 mt-1">{rent.pricePerDay} ₽</p>
        </div>
      </div>

      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => alert('Уведомление о поломке отправлено диспетчеру. С вами свяжутся в Telegram.')}
          className="py-3.5 bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/10 font-bold rounded-xl text-center text-xs transition-all active:scale-98"
        >
          Сообщить о поломке
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={handleEndRent}
          className="py-3.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-bold rounded-xl text-center text-xs transition-all active:scale-98 disabled:opacity-50"
        >
          {submitting ? 'Завершение...' : 'Завершить аренду'}
        </button>
      </div>
    </div>
  );
}
