"use client";

import React, { useEffect, useState } from "react";

interface Bike {
  id: number;
  name: string;
  price: string;
  status: string;
}

export default function HomeCatalog() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/bikes")
      .then((res) => res.json())
      .then((data) => {
        setBikes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // --- ИЗОЛЯЦИЯ РАЗМЕТКИ (Жесткое архитектурное ограничение) ---
  // Генерируем массив элементов через плоский цикл строго ВЫШЕ блока return.
  
  const bikeCards: React.JSX.Element[] = [];

  if (loading) {
    bikeCards.push(
      <div key="loading" className="col-span-full text-center text-zinc-400 py-12 animate-pulse text-sm">
        Загрузка доступных электровелосипедов...
      </div>
    );
  } else {
    for (let i = 0; i < bikes.length; i++) {
      const bike = bikes[i];
      const isFree = bike.status === "FREE";
      
      // Настройка отображения статуса
      const statusText = isFree ? "Доступен" : "В аренде";
      const statusClass = isFree 
        ? "bg-lime-400/10 text-lime-400 border-lime-400/20" 
        : "bg-zinc-800 text-zinc-500 border-zinc-700";

      // Флаг того, что именно этот байк сейчас отправляется на сервер
      const isCurrentLoading = actionLoading === bike.id;
      const buttonText = isCurrentLoading ? "Оформление..." : "Оформить";

      // Функция отправки POST-запроса на аренду
      const handleOrder = async () => {
        setActionLoading(bike.id);
        
        try {
          const response = await fetch("/api/user/rent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ bikeId: bike.id }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Не удалось оформить аренду");
          }

          // Если аренда успешна, перенаправляем курьера прямо в личный кабинет
          window.location.href = "/dashboard";

        } catch (error: any) {
          alert(`Ошибка: ${error.message}`);
          setActionLoading(null);
        }
      };

      bikeCards.push(
        <div 
          key={bike.id} 
          className="rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden transition-all hover:border-slate-700 duration-200 shadow-xl"
        >
          {/* Имитация блока фото с заглушкой (стили подходят под MonStar) */}
          <div className="relative w-full h-40 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center border-b border-slate-900 p-4 text-center">
            <span className="text-4xl">⚡</span>
            <span className={`absolute top-3 right-3 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${statusClass}`}>
              {statusText}
            </span>
          </div>

          {/* Контент карточки */}
          <div className="p-5">
            <h3 className="text-lg font-black text-white tracking-tight uppercase mb-1">
              {bike.name}
            </h3>
            <p className="text-zinc-500 text-[11px] mb-4 uppercase tracking-widest font-medium">
              Для долгих курьерских смен
            </p>
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Цена аренды</span>
                <span className="text-base font-black text-lime-400">{bike.price} ₽ <span className="text-xs font-normal text-zinc-400">/ сут</span></span>
              </div>
              
              <button
                onClick={handleOrder}
                disabled={!isFree || actionLoading !== null}
                className="px-4 py-2 bg-white hover:bg-slate-100 disabled:bg-zinc-900 disabled:text-zinc-600 text-slate-950 text-xs font-black rounded-xl transition-all"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
      {bikeCards}
    </div>
  );
}
