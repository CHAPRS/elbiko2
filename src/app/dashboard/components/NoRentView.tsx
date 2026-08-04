"use client";

import React from "react";

export default function NoRentView() {
  // Архитектурное ограничение: Вся логика и элементы подготавливаются ВЫШЕ блока return.
  // Внутри return будет находиться исключительно чистая плоская верстка.
  
  const handleGoToCatalog = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md max-w-xl mx-auto my-8">
      <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-yellow-500/10 text-yellow-500 text-3xl">
        🚲
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
        У вас нет активной аренды
      </h2>
      
      <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm">
        Чтобы начать зарабатывать, выберите доступный электровелосипед в нашем каталоге и оформите аренду.
      </p>
      
      <button
        onClick={handleGoToCatalog}
        className="w-full sm:w-auto px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-yellow-500/10 active:scale-[0.98]"
      >
        Перейти в каталог
      </button>
    </div>
  );
}
