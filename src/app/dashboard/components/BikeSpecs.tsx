import React from 'react';
import WaterproofBadge from './WaterproofBadge';

interface BikeSpecsProps {
  bike: any;
}

export default function BikeSpecs({ bike }: BikeSpecsProps) {
  if (!bike) {
    return (
      <div className="p-6 bg-[#16161F]/40 border border-white/5 rounded-2xl text-center text-gray-500 text-sm">
        У вас пока нет активных сессий аренды электровелосипеда.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1C1C24] p-3 rounded-xl border border-white/5 text-center">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Скорость</p>
          <p className="text-sm font-bold text-white mt-1">{bike.speed}</p>
        </div>
        <div className="bg-[#1C1C24] p-3 rounded-xl border border-white/5 text-center">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Запас хода</p>
          <p className="text-sm font-bold text-white mt-1">{bike.range}</p>
        </div>
        <div className="bg-[#1C1C24] p-3 rounded-xl border border-white/5 text-center">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Мотор</p>
          <p className="text-sm font-bold text-white mt-1">{bike.motor}</p>
        </div>
      </div>
      <WaterproofBadge isWaterproof={bike.isWaterproof} />
    </div>
  );
}
