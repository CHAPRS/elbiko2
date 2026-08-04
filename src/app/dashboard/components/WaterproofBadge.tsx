import React from 'react';

interface WaterproofBadgeProps {
  isWaterproof: boolean | undefined;
}

export default function WaterproofBadge({ isWaterproof }: WaterproofBadgeProps) {
  if (isWaterproof) {
    return (
      <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-xl text-xs font-medium">
        <span>💧 Аквазащита IPX7</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 text-gray-400 px-3 py-1.5 rounded-xl text-xs font-medium">
      <span>⚠️ Стандартная защита</span>
    </div>
  );
}
