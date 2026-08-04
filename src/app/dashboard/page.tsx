"use client";

import React, { useEffect, useState } from "react";
import ActiveRentView from "./components/ActiveRentView";
import NoRentView from "./components/NoRentView";

interface CourierProfile {
  id: number;
  phone: string;
  balance: string;
  activeRental: any | null;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Выносим загрузку профиля в отдельную функцию, чтобы вызывать её повторно при сдаче байка
  const fetchProfile = () => {
    fetch("/api/courier/me")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка загрузки профиля");
        }
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- ИЗОЛЯЦИЯ РАЗМЕТКИ (Жесткое архитектурное ограничение) ---
  // Все ветвления выполняются строго ВЫШЕ блока return
  
  let currentView = null;
  let balanceDisplay = "0.00";

  if (loading) {
    currentView = (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-zinc-400 font-medium animate-pulse text-sm">
          Загрузка личного кабинета...
        </div>
      </div>
    );
  } else if (error) {
    currentView = (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center my-4">
        {error}
      </div>
    );
  } else if (profile && profile.activeRental) {
    // Передаем обязательный пропс rent и функцию обновления onRentTerminated
    currentView = (
      <ActiveRentView 
        rent={profile.activeRental} 
        onRentTerminated={fetchProfile} 
      />
    );
    balanceDisplay = profile.balance;
  } else {
    currentView = <NoRentView />;
    if (profile) {
      balanceDisplay = profile.balance;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-8 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Личный кабинет курьера
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Панель управления Elbiko Eco-Sharing
            </p>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
              Баланс:
            </span>
            <span className="text-xl font-black text-yellow-500">
              {balanceDisplay} ₽
            </span>
          </div>
        </header>

        <main>
          {currentView}
        </main>

      </div>
    </div>
  );
}
