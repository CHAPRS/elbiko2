'use client';
import React, { useEffect, useState } from 'react';
import { useRentStore } from '@/store/useRentStore';
import { CONTACTS } from '@/app/constants';

export function ContactModal() {
  const { isContactModalOpen, toggleContactModal, contactModalType } = useRentStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Заголовки в зависимости от типа модалки
  const titles = {
    tariff: 'Выбор тарифа',
    business: 'Сотрудничество с юр. лицами',
    repair: 'Заявка на ремонт'
  };

  const descriptions = {
    tariff: 'Выберите удобный способ связи для консультации по тарифам',
    business: 'Выберите удобный способ связи для обсуждения сотрудничества',
    repair: 'Выберите удобный способ связи для оформления заявки на ремонт'
  };

  // Блокируем скролл основной страницы при открытой модалке
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isContactModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isContactModalOpen]);

  if (!isContactModalOpen) return null;

  const handleCallOrder = async () => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanPhone) {
      alert('Введите имя и телефон');
      return;
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          message: 'Заказ звонка',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Заявка отправлена. Мы перезвоним вам.');
        setName('');
        setPhone('');
        toggleContactModal(false);
      } else {
        alert(data.error || 'Ошибка при отправке заявки');
      }
    } catch (error) {
      alert('Ошибка соединения с сервером');
    }
  };

  const handleContact = (type: 'telegramManager' | 'max' | 'phone') => {
    switch (type) {
      case 'telegramManager':
        window.open(CONTACTS.telegramManager, '_blank');
        break;
      case 'max':
        if (CONTACTS.maxUrl) {
          window.open(CONTACTS.maxUrl, '_blank');
        } else {
          alert('Свяжитесь с нами через Telegram или по телефону. MAX: ' + CONTACTS.maxPhoneDisplay);
          return;
        }
        break;
      case 'phone':
        window.location.href = `tel:${CONTACTS.phone}`;
        break;
    }
    toggleContactModal(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={() => toggleContactModal(false)}
    >
      <div 
        className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Декоративное свечение */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Кнопка закрытия */}
        <button 
          onClick={() => toggleContactModal(false)} 
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Закрыть"
        >
          ✕
        </button>

        <h3 className="text-2xl font-black text-white tracking-tight">
          {titles[contactModalType || 'tariff']}
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {descriptions[contactModalType || 'tariff']}
        </p>

        {/* Форма заказа звонка */}
        <div className="mt-6 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Телефон"
            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Варианты связи */}
        <div className="mt-6 space-y-4">
          {/* Заказать звонок */}
          <button
            onClick={handleCallOrder}
            className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-emerald-500/50 hover:bg-slate-950/80 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl group-hover:bg-emerald-500/20 transition-colors">
              🤖
            </div>
            <div className="text-left flex-1">
              <div className="font-bold text-white">Заказать звонок</div>
              <div className="text-xs text-slate-400">Мы перезвоним</div>
            </div>
            <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">
              →
            </div>
          </button>

          {/* Telegram Manager */}
          <button
            onClick={() => handleContact('telegramManager')}
            className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-emerald-500/50 hover:bg-slate-950/80 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/30 flex items-center justify-center text-2xl group-hover:bg-[#0088cc]/20 transition-colors">
              ✈️
            </div>
            <div className="text-left flex-1">
              <div className="font-bold text-white">Telegram</div>
              <div className="text-xs text-slate-400">Написать менеджеру</div>
            </div>
            <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">
              →
            </div>
          </button>

          {/* Телефон */}
          <button
            onClick={() => handleContact('phone')}
            className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-emerald-500/50 hover:bg-slate-950/80 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl group-hover:bg-emerald-500/20 transition-colors">
              📞
            </div>
            <div className="text-left flex-1">
              <div className="font-bold text-white">Позвонить</div>
              <div className="text-xs text-slate-400">{CONTACTS.phoneDisplay}</div>
            </div>
            <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">
              →
            </div>
          </button>

          {/* MAX */}
          {CONTACTS.maxUrl ? (
            <button
              onClick={() => handleContact('max')}
              className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-emerald-500/50 hover:bg-slate-950/80 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl group-hover:bg-purple-500/20 transition-colors">
                💬
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-white">MAX</div>
                <div className="text-xs text-slate-400">Написать в MAX</div>
              </div>
              <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">
                →
              </div>
            </button>
          ) : (
            <div className="w-full p-4 bg-slate-950/30 border border-slate-800/50 rounded-2xl flex items-center gap-4 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-2xl">
                💬
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-slate-400">MAX</div>
                <div className="text-xs text-slate-500">{CONTACTS.maxPhoneDisplay}</div>
              </div>
              <div className="text-slate-600">
                ℹ️
              </div>
            </div>
          )}
        </div>

        {/* Информация */}
        <div className="mt-6 p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-400">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">ℹ️</span>
            <span>Мы ответим в течение 10 минут в рабочее время с 9:00 до 21:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactModal;