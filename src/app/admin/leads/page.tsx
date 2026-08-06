'use client';

import React, { useState, useEffect } from 'react';

interface Lead {
  id: number;
  name: string;
  phone: string;
  bikeName?: string;
  status: string;
  message?: string;
  createdAt: string;
  bike?: {
    id: number;
    name: string;
    status: string;
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    try {
      const url = filter === 'ALL' 
        ? '/api/admin/leads' 
        : `/api/admin/leads?status=${filter}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки заявок:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить заявку?')) return;

    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error('Ошибка при удалении заявки:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      NEW: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
      IN_PROGRESS: 'bg-amber-950 text-amber-400 border border-amber-800',
      CONFIRMED: 'bg-blue-950 text-blue-400 border border-blue-800',
      REJECTED: 'bg-rose-950 text-rose-400 border border-rose-800',
    };
    return badges[status] || 'bg-slate-950 text-slate-400 border border-slate-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: 'Новая',
      IN_PROGRESS: 'В работе',
      CONFIRMED: 'Подтверждена',
      REJECTED: 'Отклонена',
    };
    return labels[status] || status;
  };

  // Генерация строк таблицы
  const leadRows: React.ReactElement[] = [];

  if (isLoading) {
    leadRows.push(
      <tr key="loading" className="border-b border-slate-800">
        <td colSpan={6} className="p-4 text-center text-slate-400">Загрузка данных...</td>
      </tr>
    );
  } else if (leads.length === 0) {
    leadRows.push(
      <tr key="empty" className="border-b border-slate-800">
        <td colSpan={6} className="p-4 text-center text-slate-400">Заявки не найдены</td>
      </tr>
    );
  } else {
    leads.forEach((lead) => {
      leadRows.push(
        <tr key={lead.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
          <td className="p-4 font-medium text-white">{lead.id}</td>
          <td className="p-4 text-white">{lead.name}</td>
          <td className="p-4 text-slate-300">{lead.phone}</td>
          <td className="p-4 text-slate-300">{lead.bikeName || '-'}</td>
          <td className="p-4 text-sm">
            <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(lead.status)}`}>
              {getStatusLabel(lead.status)}
            </span>
          </td>
          <td className="p-4 text-right space-x-2">
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="NEW">Новая</option>
              <option value="IN_PROGRESS">В работе</option>
              <option value="CONFIRMED">Подтвердить</option>
              <option value="REJECTED">Отклонить</option>
            </select>
            <button
              onClick={() => handleDelete(lead.id)}
              className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs transition-colors"
            >
              Удалить
            </button>
          </td>
        </tr>
      );
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-8">
          Управление заявками
        </h1>

        {/* Фильтры */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('NEW')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'NEW'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Новые
          </button>
          <button
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'IN_PROGRESS'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            В работе
          </button>
          <button
            onClick={() => setFilter('CONFIRMED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'CONFIRMED'
                ? 'bg-blue-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Подтвержденные
          </button>
        </div>

        {/* Таблица заявок */}
        <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Имя</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Телефон</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Велосипед</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Статус</th>
                <th className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody>
              {leadRows}
            </tbody>
          </table>
        </div>

        {/* Статистика */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-emerald-400">{leads.filter(l => l.status === 'NEW').length}</div>
            <div className="text-xs text-slate-400">Новых</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-amber-400">{leads.filter(l => l.status === 'IN_PROGRESS').length}</div>
            <div className="text-xs text-slate-400">В работе</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-blue-400">{leads.filter(l => l.status === 'CONFIRMED').length}</div>
            <div className="text-xs text-slate-400">Подтверждено</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-slate-400">{leads.length}</div>
            <div className="text-xs text-slate-400">Всего</div>
          </div>
        </div>
      </div>
    </div>
  );
}