'use client';

import React, { useState } from 'react';

interface MileagePromptProps {
  title: string;
  subtitle?: string;
  currentMileage?: number | null;
  busy?: boolean;
  onSubmit: (mileage: number | null) => void;
  onCancel: () => void;
}

export function MileagePrompt({
  title,
  subtitle,
  currentMileage,
  busy,
  onSubmit,
  onCancel,
}: MileagePromptProps) {
  const [value, setValue] = useState('');

  const trimmed = value.trim();
  const parsed = trimmed === '' ? null : Number(trimmed);
  const invalid = parsed !== null && (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed));
  const decreased =
    parsed !== null && !invalid && currentMileage != null && parsed < currentMileage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <h2 className="mb-1 text-lg font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="mb-4 text-sm text-slate-400">{subtitle}</p>}

        <label className="block text-xs font-medium text-slate-400 mb-1">
          Текущий пробег, км (необязательно)
          {currentMileage != null && (
            <span className="text-slate-500"> — было {currentMileage.toLocaleString('ru-RU')} км</span>
          )}
        </label>
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
          placeholder="Оставьте пустым, чтобы не записывать"
          autoFocus
        />
        {invalid && (
          <p className="mt-1 text-xs text-rose-400">Введите целое число не меньше 0</p>
        )}
        {decreased && (
          <p className="mt-1 text-xs text-amber-400">
            Внимание: пробег меньше предыдущего значения ({currentMileage} км)
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            disabled={busy || invalid}
            onClick={() => onSubmit(invalid ? null : parsed)}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {busy ? 'Сохранение...' : parsed === null ? 'Продолжить без пробега' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-sm transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
