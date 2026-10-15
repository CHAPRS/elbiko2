'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isAdmin) {
        const response = await fetch('/api/auth/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Ошибка авторизации');
          setLoading(false);
          return;
        }

        router.push('/admin');
      } else {
        const response = await fetch('/api/auth/courier/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Ошибка авторизации');
          setLoading(false);
          return;
        }

        router.push('/dashboard');
      }
    } catch (err) {
      setError('Не удалось связаться с сервером');
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
            {isAdmin ? 'Вход в панель администратора' : 'Вход в кабинет курьера'}
          </p>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setIsAdmin(false)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              !isAdmin
                ? 'bg-amber-500 text-[#0F0F12]'
                : 'bg-[#1C1C24] text-gray-400 border border-white/5'
            }`}
          >
            Курьер
          </button>
          <button
            type="button"
            onClick={() => setIsAdmin(true)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              isAdmin
                ? 'bg-amber-500 text-[#0F0F12]'
                : 'bg-[#1C1C24] text-gray-400 border border-white/5'
            }`}
          >
            Администратор
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isAdmin ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Логин администратора
              </label>
              <input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl bg-[#1C1C24] border border-white/5 focus:border-amber-500/50 text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Email или телефон
              </label>
              <input
                type="text"
                placeholder="example@mail.ru или +7 999 111 22 33"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl bg-[#1C1C24] border border-white/5 focus:border-amber-500/50 text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>
          )}

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

        {!isAdmin && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-amber-400 hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
