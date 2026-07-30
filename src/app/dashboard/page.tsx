'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Импортируем твой РЕАЛЬНЫЙ Zustand-стор из правильного пути!
import { useRentStore } from '@/store/useRentStore';

interface Bike {
  id: string;
  title: string;
  power: string;
  maxSpeed: string;
  batteryLife: string;
}

interface Rent {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  bike: Bike;
}

export default function DashboardPage() {
  // Достаем данные из твоего реального Zustand-стора
  const store = useRentStore() as any;
  // Автоматический фоллбек: проверяем сначала поле userPhone, затем phone, иначе null
  const userPhone = store.userPhone || store.phone || null;

  const router = useRouter();
  const [rent, setRent] = useState<Rent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Безопасность: если курьер не авторизован в Zustand, перенаправляем на главную к модалке входа
    if (!userPhone) {
      router.push('/');
      return;
    }

    async function fetchActiveRent() {
      try {
        const res = await fetch(`/api/user/rent?phone=${userPhone}`);
        if (!res.ok) throw new Error('Ошибка сети');
        
        const data = await res.json();
        if (data.activeRent) {
          setRent(data.activeRent);
        } else {
          setRent(null);
        }
      } catch (err) {
        console.error('Не удалось загрузить данные личного кабинета:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchActiveRent();
  }, [userPhone, router]);

  // Функция сдачи байка (Шаг 2)
  const handleReturnBike = async () => {
    if (!rent || submitting) return;

    if (!confirm('Вы уверены, что хотите завершить аренду и сдать велосипед?')) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/rent', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rentId: rent.id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('Байк успешно сдан! Спасибо.');
        setRent(null); // Интерфейс реактивно переключится в режим "Нет активной аренды"
      } else {
        alert(data.error || 'Произошла ошибка при сдаче байка');
      }
    } catch (err) {
      console.error('Ошибка при отправке запроса:', err);
      alert('Ошибка соединения с сервером');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a16] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a16] text-white p-6 font-sans antialiased selection:bg-cyan-500 selection:text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Шапка кабинета */}
        <div className="flex justify-between items-center border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Кабинет курьера
            </h1>
            <p className="text-gray-400 text-sm mt-1">Активный профиль: {userPhone}</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition duration-200"
          >
            На главную
          </button>
        </div>

        {/* Сетка информации */}
        {rent ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Левая колонка: Характеристики текущего байка */}
            <div className="md:col-span-2 backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.1)] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Байк на руках ({rent.status})
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    ID: {rent.id.slice(-8)}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold mb-4">{rent.bike.title || 'Электровелосипед курьера'}</h2>
                
                {/* Грид спецификаций */}
                <div className="grid grid-cols-3 gap-4 my-6">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                    <p className="text-xs text-gray-400 mb-1">Мощность</p>
                    <p className="font-bold text-cyan-400 text-lg">{rent.bike.power}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                    <p className="text-xs text-gray-400 mb-1">Скорость</p>
                    <p className="font-bold text-cyan-400 text-lg">{rent.bike.maxSpeed}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                    <p className="text-xs text-gray-400 mb-1">Запас хода</p>
                    <p className="font-bold text-cyan-400 text-lg">{rent.bike.batteryLife}</p>
                  </div>
                </div>
              </div>

              {/* Кнопка сдачи байка */}
              <button 
                onClick={handleReturnBike}
                disabled={submitting}
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 font-semibold rounded-xl transition duration-200 active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? 'Завершение...' : 'Завершить аренду / Сдать байк'}
              </button>
            </div>

            {/* Правая колонка: Финансовые данные подписки */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-200">Информация</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400">Статус биллинга</p>
                    <p className="text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Оплачено
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Начало аренды</p>
                    <p className="text-white font-medium mt-0.5">
                      {new Date(rent.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/5 text-xs text-gray-400 leading-relaxed">
                Автопродление активно. Списание за новые сутки происходит автоматически.
              </div>
            </div>

          </div>
        ) : (
          /* Окно, если аренды нет */
          <div className="backdrop-blur-md bg-white/5 border border-white/10 p-12 rounded-2xl text-center shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            <p className="text-xl text-gray-200 font-medium mb-2">У вас нет активной аренды</p>
            <p className="text-sm text-gray-400 mb-6">Чтобы взять электровелосипед, вернитесь в каталог.</p>
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold rounded-xl hover:opacity-95 transition active:scale-[0.98]"
            >
              Выбрать электровелосипед
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
