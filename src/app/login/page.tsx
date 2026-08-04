'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/courier/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка авторизации');
        setLoading(false);
        return;
      }

      // Перенаправляем в защищенный личный кабинет курьера
      router.push('/dashboard');
    } catch (err) {
      setError('Не удалось связаться с сервером');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] text-white flex flex-col justify-center items-center px-4">
      {/* Стеклянная карточка формы */}
      <div className="w-full max-w-md bg-[#16161F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        
        {/* Хедер формы */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            ELBIKO
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Вход в кабинет курьера
          </p>
        </div>

        {/* Вывод ошибки (без тернарного оператора внутри общего return) */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Номер телефона
            </label>
            <input
              type="tel"
              placeholder="+7 (999) 111-22-33"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-[#1C1C24] border border-white/5 focus:border-amber-500/50 text-white placeholder-gray-600 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Пароль
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-[#1C1C24] border border-white/5 focus:border-amber-500/50 text-white placeholder-gray-600 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-[#0F0F12] font-bold tracking-wide transition-all shadow-lg shadow-orange-500/10 disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : 'Войти в систему'}
          </button>
        </form>

      </div>
    </div>
  );
}
