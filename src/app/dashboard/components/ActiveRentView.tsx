'use client';

import React, { useState } from 'react';

// Уточните типы в соответствии с вашим Prisma-схемой
interface ActiveRentViewProps {
  rent: any; 
  onRentTerminated: () => void;
}

export default function ActiveRentView({ rent, onRentTerminated }: ActiveRentViewProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleReturnBike = async () => {
    // ... Логика отправки PATCH запроса (как в оригинале)
    // Включая setSubmitting, fetch('/api/user/rent'), onRentTerminated()
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Левая колонка: Характеристики текущего байка */}
      <div className="md:col-span-2 backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">{rent.bike.title}</h2>
        {/* Данные байка (power, maxSpeed, batteryLife) */}
        <button onClick={handleReturnBike} disabled={submitting} className="...">
          {submitting ? 'Завершение...' : 'Завершить аренду'}
        </button>
      </div>
      {/* Правая колонка: Информация (дата, статус) */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl">
        <p>{new Date(rent.createdAt).toLocaleDateString('ru-RU')}</p>
      </div>
    </div>
  );
}
