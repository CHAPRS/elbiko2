'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LEAD_STATUSES, LEAD_STATUS_LABELS, LeadStatus } from '@/lib/leadStatus';

interface Lead {
  id: number;
  name: string;
  phone: string;
  bikeName?: string | null;
  status: LeadStatus;
  message?: string | null;
  comment?: string | null;
  rejectReason?: string | null;
  processedAt?: string | null;
  rentId?: number | null;
  bikeId?: number | null;
  createdAt: string;
  bike?: {
    id: number;
    name: string;
    status: string;
  } | null;
}

interface Bike {
  id: number;
  name: string;
  status: string;
}

const STATUS_BADGE: Record<LeadStatus, string> = {
  NEW: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
  IN_PROGRESS: 'bg-amber-950 text-amber-400 border border-amber-800',
  CONFIRMED: 'bg-blue-950 text-blue-400 border border-blue-800',
  REJECTED: 'bg-rose-950 text-rose-400 border border-rose-800',
};

const FILTERS: Array<{ value: 'ALL' | LeadStatus; label: string }> = [
  { value: 'ALL', label: 'Все' },
  ...LEAD_STATUSES.map((status) => ({ value: status, label: LEAD_STATUS_LABELS[status] })),
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | LeadStatus>('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [comment, setComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rentDays, setRentDays] = useState('1');
  const [rentBikeId, setRentBikeId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const url = filter === 'ALL' ? '/api/admin/leads' : `/api/admin/leads?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Не удалось загрузить заявки');
        return;
      }

      setLeads(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки заявок:', err);
      setError('Нет связи с сервером');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetch('/api/admin/bikes')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setBikes(data);
      })
      .catch((err) => console.error('Ошибка загрузки автопарка:', err));
  }, []);

  const openLead = (lead: Lead) => {
    setSelectedLead(lead);
    setComment(lead.comment || '');
    setRejectReason(lead.rejectReason || '');
    setRentBikeId(lead.bikeId ? String(lead.bikeId) : '');
    setRentDays('1');
    setNotice(null);
    setError(null);
  };

  const patchLead = async (id: number, payload: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Не удалось обновить заявку');
        return null;
      }

      setError(null);
      fetchLeads();
      if (selectedLead?.id === id) setSelectedLead(data);
      return data as Lead;
    } catch (err) {
      console.error('Ошибка при обновлении заявки:', err);
      setError('Нет связи с сервером');
      return null;
    }
  };

  const handleStatusChange = (id: number, status: LeadStatus, reason?: string) => {
    if (status === 'REJECTED' && !reason) {
      setError('Укажите причину отказа в карточке заявки');
      const lead = leads.find((item) => item.id === id);
      if (lead) openLead(lead);
      return;
    }
    patchLead(id, { status, ...(reason ? { rejectReason: reason } : {}) });
  };

  const handleSaveDetails = async () => {
    if (!selectedLead) return;
    const updated = await patchLead(selectedLead.id, { comment, rejectReason });
    if (updated) setNotice('Карточка заявки сохранена');
  };

  const handleConvert = async () => {
    if (!selectedLead) return;

    try {
      const res = await fetch(`/api/admin/leads/${selectedLead.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days: Number(rentDays) || 1,
          bikeId: rentBikeId ? Number(rentBikeId) : null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Не удалось оформить аренду');
        return;
      }

      setError(null);
      setNotice(`Аренда №${data.rentId} оформлена`);
      setSelectedLead(data.lead);
      fetchLeads();
    } catch (err) {
      console.error('Ошибка при оформлении аренды:', err);
      setError('Нет связи с сервером');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить заявку?')) return;

    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Не удалось удалить заявку');
        return;
      }

      if (selectedLead?.id === id) setSelectedLead(null);
      setError(null);
      fetchLeads();
    } catch (err) {
      console.error('Ошибка при удалении заявки:', err);
      setError('Нет связи с сервером');
    }
  };

  const leadRows: React.ReactElement[] = [];

  if (isLoading) {
    leadRows.push(
      <tr key="loading" className="border-b border-slate-800">
        <td colSpan={7} className="p-4 text-center text-slate-400">Загрузка данных...</td>
      </tr>
    );
  } else if (leads.length === 0) {
    leadRows.push(
      <tr key="empty" className="border-b border-slate-800">
        <td colSpan={7} className="p-4 text-center text-slate-400">Заявки не найдены</td>
      </tr>
    );
  } else {
    leads.forEach((lead) => {
      leadRows.push(
        <tr
          key={lead.id}
          className={`border-b border-slate-800 hover:bg-slate-900/50 transition-colors ${
            selectedLead?.id === lead.id ? 'bg-slate-900/70' : ''
          }`}
        >
          <td className="p-4 font-medium text-white">{lead.id}</td>
          <td className="p-4 text-white">{lead.name}</td>
          <td className="p-4 text-slate-300">{lead.phone}</td>
          <td className="p-4 text-slate-300">{lead.bike?.name || lead.bikeName || '-'}</td>
          <td className="p-4 text-slate-400 text-xs whitespace-nowrap">
            {new Date(lead.createdAt).toLocaleString('ru-RU')}
          </td>
          <td className="p-4 text-sm">
            <span className={`px-2 py-1 rounded text-xs ${STATUS_BADGE[lead.status]}`}>
              {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
            </span>
            {lead.rentId && (
              <span className="ml-2 text-xs text-slate-400">аренда №{lead.rentId}</span>
            )}
          </td>
          <td className="p-4 text-right space-x-2 whitespace-nowrap">
            <button
              onClick={() => openLead(lead)}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition-colors"
            >
              Открыть
            </button>
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus, lead.rejectReason || undefined)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {LEAD_STATUS_LABELS[status]}
                </option>
              ))}
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

        <div className="mb-6 flex gap-3 flex-wrap">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === value
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-xl overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Имя</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Телефон</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Велосипед</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Создана</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Статус</th>
                  <th className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody>{leadRows}</tbody>
            </table>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-xl p-6 h-fit">
            {!selectedLead ? (
              <p className="text-slate-400 text-sm">Выберите заявку, чтобы обработать её.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-emerald-400">Заявка #{selectedLead.id}</h2>
                  <p className="text-sm text-slate-300 mt-1">
                    {selectedLead.name} · {selectedLead.phone}
                  </p>
                  {selectedLead.message && (
                    <p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap">{selectedLead.message}</p>
                  )}
                  {selectedLead.processedAt && (
                    <p className="text-xs text-slate-500 mt-2">
                      Обработана: {new Date(selectedLead.processedAt).toLocaleString('ru-RU')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Комментарий менеджера</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Причина отказа</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleSaveDetails}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs transition-colors"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedLead.id, 'IN_PROGRESS')}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs transition-colors"
                  >
                    В работу
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedLead.id, 'REJECTED', rejectReason)}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs transition-colors"
                  >
                    Отклонить
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-200">Оформить аренду</h3>

                  {selectedLead.rentId ? (
                    <p className="text-xs text-slate-400">
                      По заявке уже оформлена аренда №{selectedLead.rentId}
                    </p>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Велосипед</label>
                        <select
                          value={rentBikeId}
                          onChange={(e) => setRentBikeId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm"
                        >
                          <option value="">— выберите —</option>
                          {bikes
                            .filter((bike) => bike.status === 'FREE' || bike.id === selectedLead.bikeId)
                            .map((bike) => (
                              <option key={bike.id} value={bike.id}>
                                {bike.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Срок, дней</label>
                        <input
                          type="number"
                          min="1"
                          value={rentDays}
                          onChange={(e) => setRentDays(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>

                      <button
                        onClick={handleConvert}
                        className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Подтвердить и создать аренду
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {LEAD_STATUSES.map((status) => (
            <div key={status} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <div className="text-2xl font-bold text-white">
                {leads.filter((lead) => lead.status === status).length}
              </div>
              <div className="text-xs text-slate-400">{LEAD_STATUS_LABELS[status]}</div>
            </div>
          ))}
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-white">{leads.length}</div>
            <div className="text-xs text-slate-400">Всего</div>
          </div>
        </div>
      </div>
    </div>
  );
}
