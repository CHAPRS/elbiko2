'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Проверяем ссылку...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Некорректная ссылка.');
      return;
    }

    fetch(`/api/auth/courier/verify?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.alreadyVerified ? 'Email уже подтверждён.' : 'Email успешно подтверждён.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Не удалось подтвердить email.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Не удалось связаться с сервером.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0F0F12] text-white flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-[#16161F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          ЭльБайко
        </h1>

        <div
          className={`p-4 rounded-xl text-sm ${
            status === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : status === 'error'
              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
              : 'bg-gray-500/10 border border-gray-500/20 text-gray-400'
          }`}
        >
          {message}
        </div>

        {status === 'success' && (
          <Link
            href="/login"
            className="inline-block w-full h-12 leading-[48px] rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-[#0F0F12] font-bold tracking-wide"
          >
            Войти
          </Link>
        )}

        {status === 'error' && (
          <p className="text-sm text-gray-500">
            <Link href="/register" className="text-amber-400 hover:underline">
              Зарегистрироваться заново
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F0F12] text-white flex flex-col justify-center items-center px-4">
          <div className="text-gray-400 text-sm">Загрузка...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
