'use client';
import React, { useEffect } from 'react';
import { useRentStore } from '@/store/useRentStore';

export function ContactModal() {
  const { isContactModalOpen, toggleContactModal, contactModalType } = useRentStore();

  // Контактные данные
  const contactData = {
    telegram: 'https://t.me/my_own_elbiko_bot',
    max: null, // Канал в Макс пока не создан - заглушка
    phone: '+79878479289'
  };

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
    if (isContactModalOpen) {
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
  }, [isContactModalOpen]);

  if (!isContactModalOpen) return null;

  const handleContact = (type: 'telegram' | 'max' | 'phone') => {
    switch (type) {
      case 'telegram':
        window.open(contactData.telegram, '_blank');
        break;
      case 'max':
        alert('Канал в Макс мессенджере пока не создан. Свяжитесь с нами через Telegram или по телефону.');
        return; // Не закрываем модалку
      case 'phone':
        window.location.href = `tel:${contactData.phone}`;
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
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>

        <h3 className="text-2xl font-black text-white tracking-tight">
          {titles[contactModalType || 'tariff']}
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {descriptions[contactModalType || 'tariff']}
        </p>

        {/* Варианты связи */}
        <div className="mt-8 space-y-4">
          {/* Telegram */}
          <button
            onClick={() => handleContact('telegram')}
            className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-emerald-500/50 hover:bg-slate-950/80 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/30 flex items-center justify-center text-2xl group-hover:bg-[#0088cc]/20 transition-colors">
              ✈️
            </div>
            <div className="text-left flex-1">
              <div className="font-bold text-white">Telegram</div>
              <div className="text-xs text-slate-400">Написать в Telegram</div>
            </div>
            <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">
              →
            </div>
          </button>

          {/* Макс */}
          <button
            onClick={() => handleContact('max')}
            className="w-full p-4 bg-slate-950/30 border border-slate-800/50 rounded-2xl flex items-center gap-4 opacity-60 cursor-not-allowed group"
            disabled
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-2xl">
              💬
            </div>
            <div className="text-left flex-1">
              <div className="font-bold text-slate-400">Макс</div>
              <div className="text-xs text-slate-500">Канал в разработке</div>
            </div>
            <div className="text-slate-600">
              🔒
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
              <div className="text-xs text-slate-400">{contactData.phone}</div>
            </div>
            <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">
              →
            </div>
          </button>
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