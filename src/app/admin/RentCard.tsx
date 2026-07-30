'use client';
import React from 'react';

export default function RentCard({ rent }: { rent: any }) {
  const phoneText = rent.user && rent.user.phone ? rent.user.phone : "Нет телефона";
  const bikeNameText = rent.bike && rent.bike.name ? rent.bike.name : "Удален";

  return (
    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-bold text-white text-sm">{phoneText}</span>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-blue-500/10 text-blue-400 border-blue-500/20">
          {rent.status}
        </span>
      </div>
      <div className="text-slate-400">
        <span>Транспорт: </span>
        <span className="text-slate-200">{bikeNameText}</span>
      </div>
    </div>
  );
}
