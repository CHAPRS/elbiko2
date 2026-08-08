'use client';
import React from 'react';

interface BikeRowProps {
  bike: any;
  updatingId: number | null;
  onToggleStatus: (id: number, status: string) => void;
}

export default function BikeRow({ bike, updatingId, onToggleStatus }: BikeRowProps) {
  const infoText = bike.model + " - " + bike.power;
  const costText = bike.pricePerDay + " руб/сут";
  const isButtonDisabled = updatingId === bike.id;

  return (
    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-sm">
      <div>
        <div className="font-bold text-white">{bike.name}</div>
        <div className="text-xs text-slate-400 mt-0.5">{infoText}</div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-bold text-yellow-500">{costText}</span>
        <button
          type="button"
          disabled={isButtonDisabled}
          onClick={() => onToggleStatus(bike.id, bike.status)}
          className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl border bg-slate-900 border-slate-800 hover:border-yellow-500/50 transition-all active:scale-95 text-slate-300 disabled:opacity-50"
        >
          {bike.status}
        </button>
      </div>
    </div>
  );
}
