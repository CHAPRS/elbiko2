'use client';
import React from 'react';

export default function Hero() {
  return (
    <section className="relative flex flex-col justify-center items-center px-4 py-20 min-h-screen text-center bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="absolute top-4 left-4 bg-yellow-500 text-slate-950 font-black px-3 py-1 rounded text-sm uppercase tracking-wider">
        Для Курьеров
      </div>
      <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-100">
        Арендуй электровелосипед <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          от 500 рублей в день
        </span>
      </h1>
      <p className="mt-6 max-w-lg text-lg text-slate-400 sm:text-xl">
        Зарабатывай в Яндекс Еде, Самокате и Купере в 2 раза больше. Без залога. Подменный байк за 2 часа.
      </p>
      <div className="mt-10 w-full max-w-sm sm:flex sm:justify-center">
        <a
          href="#calculator"
          className="flex justify-center items-center px-8 py-4 w-full text-lg font-bold text-slate-950 bg-yellow-500 rounded-xl transition-all shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 active:scale-95"
        >
          Забронировать байк
        </a>
      </div>
    </section>
  );
}
