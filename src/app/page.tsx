'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_BIKES, VK_TEAMS_SVG, TELEGRAM_SVG, CONTACTS_BLOCK, getFeaturesUI, getStepsUI, getReviewsUI } from './constants';

interface LocalBike {
  id: number;
  name: string;
  status: string;
  speed: string;
  range: string;
  motor: string;
  isWaterproof: boolean;
  pricePerDay: number;
}

export default function HomePage() {
  const [bikes, setBikes] = useState<LocalBike[]>(MOCK_BIKES as any);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBike, setSelectedBike] = useState<LocalBike | null>(null);
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatedTgLink, setGeneratedTgLink] = useState<string>('');

  const loadBikes = () => {
    fetch('/api/admin/bikes')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => { if (Array.isArray(data) && data.length > 0) setBikes(data); })
      .catch(() => console.log('Локальные моки используются как запасной вариант'));
  };

  useEffect(() => {
    loadBikes();
  }, []);

   const handleBookingSubmit = async () => {
    if (!clientPhone || !selectedBike) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientPhone,
          bikeId: selectedBike.id
        }),
      });

      if (response.ok) {
        const textMessage = `⚡️ ЗАЯВКА НА АРЕНДУ ⚡️\n\n🚲 Байк: ${selectedBike.name}\n👤 Имя: ${clientName || 'Не указано'}\n📞 Телефон: ${clientPhone}`;
        const nativeTgLink = `tg://msg_url?url=t.me&text=${encodeURIComponent(textMessage)}`;
        
        setGeneratedTgLink(nativeTgLink);
        loadBikes();
      } else {
        alert('Не удалось оформить бронирование в базе данных.');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла сетевая ошибка базы данных.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 font-sans space-y-24 relative">
      
      {/* Плавающий блок соцсетей */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-2 rounded-xl shadow-xl">
        <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0077FF]/10 border border-[#0077FF]/20 text-[#0077FF] transition-all duration-300 hover:bg-[#0077FF] hover:text-white">
          {VK_TEAMS_SVG}
        </a>
        <a href="https://telegram.me" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#24A1DE]/10 border border-[#24A1DE]/20 text-[#24A1DE] transition-all duration-300 hover:bg-[#24A1DE] hover:text-white">
          {TELEGRAM_SVG}
        </a>
      </div>

      {/* Модальное окно бронирования */}
      {isModalOpen && selectedBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative">
            <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-xl" onClick={() => { setIsModalOpen(false); setGeneratedTgLink(''); }}>✕</button>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">Бронирование</h3>
            <p className="text-sm text-slate-400 mb-4">Вы выбрали: <span className="text-amber-400 font-semibold">{selectedBike.name}</span></p>
            <input type="text" placeholder="Ваше имя" value={clientName} disabled={!!generatedTgLink} onChange={(e) => setClientName(e.target.value)} className="w-full mb-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-50" />
            <input type="tel" placeholder="+7 (999) 000-00-00" value={clientPhone} disabled={!!generatedTgLink} onChange={(e) => setClientPhone(e.target.value)} className="w-full mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-50" />
            
            {!generatedTgLink ? (
              <button 
                disabled={isSubmitting || !clientPhone}
                onClick={handleBookingSubmit} 
                className={`block w-full text-center py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold hover:opacity-90 transition-all ${isSubmitting || !clientPhone ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
              >
                {isSubmitting ? 'Связываемся с базой...' : 'Подтвердить бронирование'}
              </button>
            ) : (
              <a 
                href={generatedTgLink}
                onClick={() => {
                  setIsModalOpen(false);
                  setGeneratedTgLink('');
                  setClientName('');
                  setClientPhone('');
                }}
                className="block w-full text-center py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-all cursor-pointer text-sm animate-pulse"
              >
                🚀 Открыть Telegram и отправить заявку
              </a>
            )}
          </div>
        </div>
      )}

      {/* Каталог велосипедов */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Каталог электровелосипедов</h2>
        <p className="text-sm text-slate-400 mb-8">Выберите модель для комфортных поездок по городу</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bikes.map((bike) => (
            <div key={bike.id} className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-5 transition-all duration-300 hover:border-amber-500/30">
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400">{bike.name}</h3>
              
              <div className="grid grid-cols-2 gap-2 my-4 text-xs text-slate-400">
                <div>⚡ {bike.speed}</div>
                <div>🔋 {bike.range}</div>
                <div>⚙️ {bike.motor}</div>
                {bike.isWaterproof && <div className="text-emerald-400">💧 IP65</div>}
              </div>

              {bike.status === 'FREE' ? (
                <button 
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold transition-all active:scale-95" 
                  onClick={() => { setSelectedBike(bike); setIsModalOpen(true); }}
                >
                  Забронировать
                </button>
              ) : (
                <div className="w-full text-center py-2.5 px-4 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 font-medium">
                  {bike.status === 'RENTED' ? '🔒 В аренде' : '🛠️ Сервис'}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Секция преимущества */}
      <section className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Почему выбирать нас?</h2>
          <p className="text-sm text-slate-400">Создаем лучшие условия для долгосрочной и краткосрочной аренды электробайков</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{getFeaturesUI()}</div>
      </section>

      {/* Секция "Как это работает" */}
      <section className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Как работает аренда?</h2>
          <p className="text-sm text-slate-400">Три простых шага до первой поездки</p>
        </div>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 mt-12">
          <div className="absolute inset-y-0 left-1/2 md:inset-x-0 md:top-1/3 md:inset-y-auto w-0.5 md:w-full h-full md:h-0.5 bg-gradient-to-b md:bg-gradient-to-r from-amber-500/10 via-amber-500/40 to-orange-500/10 z-0" />
          {getStepsUI()}
        </div>
      </section>

      {/* Секция отзывов */}
      <section className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Отзывы наших клиентов</h2>
            <p className="text-sm text-slate-400">Что говорят курьеры и городские райдеры о наших байках</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{getReviewsUI()}</div>
      </section>

      {/* Подвал */}
      <footer className="max-w-7xl mx-auto border-t border-slate-900 pt-8 text-center md:text-left text-xs text-slate-500">
        {CONTACTS_BLOCK}
      </footer>
    </main>
  );
}
