'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Если логин успешен, Middleware теперь пропустит нас в админку
        window.location.href = '/admin';
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Ошибка авторизации');
      }
    } catch (err) {
      setErrorMsg('Не удалось связаться с сервером');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 backdrop-blur-md p-8 rounded-2xl shadow-2xl relative">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Вход в панель Elbiko
          </h1>
          <p className="text-xs text-slate-500 mt-1">Доступ только для сотрудников компании</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Имя пользователя</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Пароль</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-all" 
            />
          </div>

          {errorMsg && (
            <div className="text-xs bg-rose-950/50 border border-rose-900 text-rose-400 p-3 rounded-xl text-center font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold shadow-lg shadow-orange-500/10 transition-all duration-200 mt-2"
          >
            Войти в систему
          </button>
        </form>
      </div>
    </div>
  );
}
