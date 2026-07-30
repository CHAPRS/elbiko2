'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRentStore } from '@/store/useRentStore';

export function AuthModal() {
  const { 
    isAuthModalOpen, 
    toggleAuthModal, 
    setAuthenticated,
    toggleBookingModal // Добавили управление модалкой бронирования
  } = useRentStore();
  
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  
  // Разделяем регистрацию полей для формы телефона и кода
  const { register, handleSubmit, formState: { errors }, reset } = useForm<{ phone: string; code: string }>();

  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const onSendPhone = (data: { phone: string }) => {
    setPhone(data.phone);
    setStep('code');
    // Сбрасываем значение поля 'code', чтобы там не оставался номер телефона
    reset({ phone: data.phone, code: '' });
  };

  const onVerifyCode = (data: { code: string }) => {
    if (data.code === '1111') {
      setAuthenticated(phone); // Авторизуем пользователя в Zustand
      setStep('phone');
      reset(); // Полностью очищаем форму
      toggleAuthModal(false); // Закрываем окно входа
      
      // АВТО-ПЕРЕХОД: Сразу же открываем BookingModal обратно, чтобы продолжить оплату
      setTimeout(() => {
        toggleBookingModal(true);
      }, 100);
    } else {
      alert('Неверный код! Введите тестовый код: 1111');
    }
  };

  const handleClose = () => {
    setStep('phone');
    reset();
    toggleAuthModal(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-sm bg-slate-900/90 border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-yellow-500/10 blur-2xl pointer-events-none" />

        <button 
          onClick={handleClose} 
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {step === 'phone' ? (
          <form onSubmit={handleSubmit(onSendPhone)} className="space-y-5 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Вход для курьеров</h3>
              <p className="text-xs text-slate-400 mt-1">Введите номер телефона для авторизации</p>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Номер телефона</label>
              <input
                {...register('phone', { required: 'Введите номер телефона' })}
                type="tel"
                placeholder="+7 (999) 999-99-99"
                className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-white text-center text-lg font-medium focus:outline-none focus:border-yellow-500/80 transition-all placeholder:text-slate-600"
              />
              {errors.phone && <span className="text-red-400 text-xs mt-1.5 block font-medium">⚠️ {errors.phone.message}</span>}
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black rounded-xl text-center text-base tracking-wide transition-all active:scale-98"
            >
              Получить код
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onVerifyCode)} className="space-y-5 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Подтверждение</h3>
              <p className="text-xs text-slate-400 mt-1">
                Тестовый код: <span className="text-yellow-400 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded">1111</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Код из СМС</label>
              <input
                {...register('code', { required: 'Введите код подтверждения' })}
                type="text"
                maxLength={4}
                autoFocus
                placeholder="0 0 0 0"
                className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-white text-center text-2xl tracking-[0.7em] indent-[0.35em] font-black font-mono focus:outline-none focus:border-yellow-500/80 transition-all placeholder:text-slate-700"
              />
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setStep('phone')} 
                className="w-1/3 py-4 bg-slate-800/80 text-slate-300 font-bold rounded-xl text-sm border border-slate-700/40"
              >
                Назад
              </button>
              <button 
                type="submit" 
                className="w-2/3 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black rounded-xl text-base tracking-wide transition-all active:scale-98"
              >
                Войти
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;