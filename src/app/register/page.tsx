'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/courier/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка регистрации');
      } else {
        setSuccess(true);
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
          <p className="text-gray-400 text-sm mt-2">Регистрация курьера</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">
              Регистрация выполнена. Проверьте почту и перейдите по ссылке для подтверждения email.
            </div>
            <p className="text-sm text-gray-500">
              После подтверждения можно{' '}
              <Link href="/login" className="text-amber-400 hover:underline">
                войти
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Имя
              </label>
              <input
                type="text"
                placeholder="Иван"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#1C1C24] border border-white/5 focus:border-amber-500/50 text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="example@mail.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl bg-[#1C1C24] border border-white/5 focus:border-amber-500/50 text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>

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
                minLength={6}
                className="w-full h-12 px-4 rounded-xl bg-[#1C1C24] border border-white/5 focus:border-amber-500/50 text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Повторите пароль
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl bg-[#1C1C24] border border-white/5 focus:border-amber-500/50 text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-[#0F0F12] font-bold tracking-wide transition-all shadow-lg shadow-orange-500/10 disabled:opacity-50"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="text-amber-400 hover:underline">
                Войти
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
