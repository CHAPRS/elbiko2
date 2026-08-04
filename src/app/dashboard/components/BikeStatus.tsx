import React from 'react';

interface BikeStatusProps {
  status: string | undefined;
}

export default function BikeStatus({ status }: BikeStatusProps) {
  if (!status) {
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
        Не закреплен
      </span>
    );
  }

  if (status === 'RENTED') {
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
        Активен
      </span>
    );
  }

  return (
    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
      {status}
    </span>
  );
}
