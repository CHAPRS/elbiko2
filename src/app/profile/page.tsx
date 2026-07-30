'use client';
import React, { useEffect, useState } from 'react';
import ActiveRentCard from './ActiveRentCard';

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState('+7 (999) 111-22-33'); // Дефолтный телефон для теста
  const [currentPhone, setCurrentPhone] = useState('');
  const [courierData, setCourierData] = useState<any>(null);
  const [activeRent, setActiveRent] = useState<any>(null);

    const loadProfileData = async (phoneToFetch: string) => {
    if (!phoneToFetch) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/user/rent?phone=${encodeURIComponent(phoneToFetch)}`);
      const data = await res.json();
      
      if (data && !data.error) {
        if (data.activeRent) {
          setActiveRent({
            id: data.activeRent.id ?? data.activeRent.rentId,
            bikeName: data.activeRent.bike?.name ?? 'Электровелосипед',
            bikeModel: data.activeRent.bike?.model ?? 'Базовая модель',
            status: String(data.activeRent.status).toUpperCase(),
            daysLeft: 14,
            pricePerDay: data.activeRent.bike?.pricePerDay ?? 500
          });
        } else {
          setActiveRent(null);
        }
        setCourierData({ phone: phoneToFetch, telegramChatId: '548930211' });
        setCurrentPhone(phoneToFetch);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  // Автоматический первичный поиск при загрузке страницы
  useEffect(() => {
    loadProfileData(phoneInput);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProfileData(phoneInput);
  };

  const txtPhoneTitle = String(loading ? 'Синхронизация...' : currentPhone || 'Профиль не выбран');
  const txtTelegramStatus = 'Подключен';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-12 antialiased">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Панель тестового переключения курьеров */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p className="text-slate-400 font-mono">🔧 Режим разработки: введите телефон курьера из БД для проверки ЛК</p>
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
            <input 
              type="text" 
              value={phoneInput} 
              onChange={e => setPhoneInput(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-yellow-500"
            />
            <button type="submit" className="bg-yellow-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg transition-colors hover:bg-yellow-400">
              Войти
            </button>
          </form>
        </div>

        {/* Шапка кабинета */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Личный кабинет курьера</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">{txtPhoneTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">Telegram Bot:</span>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg border bg-green-500/10 text-green-400 border-green-500/20">
              {txtTelegramStatus}
            </span>
          </div>
        </div>

        {/* Сетка модулей профиля */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Левый блок: Основная инфо */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
            <h4 className="text-sm font-bold text-white">Статус профиля</h4>
            <div className="text-xs space-y-2 text-slate-400 font-mono">
              <p><span className="text-slate-600">Документы:</span> Проверены</p>
              <p><span className="text-slate-600">Сервис:</span> Без ограничений</p>
            </div>
          </div>

          {/* Правый блок: Вывод активной аренды курьера */}
          <div className="md:col-span-2">
            {loading && (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center text-sm font-mono text-slate-500">
                Загрузка данных вашей аренды...
              </div>
            )}
            
            {!loading && !activeRent && (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center text-sm font-mono text-slate-500">
                У вас нет активных или ожидающих сессий аренды.
              </div>
            )}
            
            {!loading && activeRent && (
              <ActiveRentCard rent={activeRent} />
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
