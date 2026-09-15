'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SetupPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const requestCode = async () => {
    setError(null);
    setMessage(null);
    if (!phone.trim()) {
      setError('Введите номер телефона');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/courier/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка');
      } else {
        setMessage('Код отправлен в Telegram');
        setStep('code');
      }
    } catch {
      setError('Не удалось связаться с сервером');
    } finally {
      setLoading(false);
    }
  };

  const setNewPassword = async () => {
    setError(null);
    setMessage(null);
    if (!code.trim() || !password || !confirm) {
      setError('Заполните все поля');
      return;
    }
    if (password.length < 6) {
      setError('Пароль минимум 6 символов');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/courier/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), code, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка');
      } else {
        setMessage('Пароль установлен. Вход...');
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch {
      setError('Не удалось связаться с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] text-white flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-[#16161F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            ЭльБайко
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {step === 'phone' ? 'Установка пароля курьера' : 'Введите код из Telegram'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl text-center">
            {message}
          </div>
        )}

        {step === 'phone' ? (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Номер телефона
              </label>
              <input
                type="tel"
                placeholder="+7 (999) 111-22-33"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#1C1C24] border border-white/5 focus:border-amber-500/50 text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={requestCode}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-[#0F0F12] font-bold tracking-wide transition-all shadow-lg shadow-orange-500/10 disabled:opacity-50"
            >
              {loading ? 'Отправка...' : 'Получить код в Telegram'}
            </button>
            <p className="text-center text-sm text-gray-500">
              <Link href="/login" className="text-amber-400 hover:underline">
                Уже есть пароль? Войти
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Код из Telegram
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#1C1C24] border border-white/5 focus:border-amber-500/50 text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Новый пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#1C1C24] border border-white/5 focus:border-amber-500/50 text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Повторите пароль
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#1C1C24] border border-white/5 focus:border-amber-500/50 text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={setNewPassword}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-[#0F0F12] font-bold tracking-wide transition-all shadow-lg shadow-orange-500/10 disabled:opacity-50"
            >
              {loading ? 'Установка...' : 'Установить пароль'}
            </button>
            <button
              onClick={() => setStep('phone')}
              type="button"
              className="w-full text-sm text-gray-400 hover:text-white"
            >
              Назад
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
