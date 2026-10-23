'use client';

import React, { useEffect, useState } from 'react';

interface Contact {
  id: number;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  lastContactAt: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  INQUIRY: 'Интересовался',
  CUSTOMER: 'Брал у нас',
  REPEAT: 'Повторная аренда',
  BLOCKED: 'Заблокирован',
};

const STATUS_BADGE: Record<string, string> = {
  INQUIRY: 'bg-slate-800 text-slate-300 border border-slate-700',
  CUSTOMER: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
  REPEAT: 'bg-amber-950 text-amber-400 border border-amber-800',
  BLOCKED: 'bg-rose-950 text-rose-400 border border-rose-800',
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/contacts?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setContacts(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки контактов:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts();
  };

  const fullName = (c: Contact) =>
    [c.lastName, c.firstName].filter(Boolean).join(' ') || '—';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent mb-8">
          База контактов
        </h1>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по фамилии, имени или телефону"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Найти
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white"
          >
            <option value="ALL">Все статусы</option>
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <option key={status} value={status}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ФИО</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Телефон</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Статус</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Источник</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Последний контакт</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Заметки</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400">Загрузка...</td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400">Контакты не найдены</td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 text-white font-medium">{fullName(contact)}</td>
                    <td className="p-4 text-slate-300">{contact.phone || '—'}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${STATUS_BADGE[contact.status] || 'bg-slate-800 text-slate-300'}`}>
                        {STATUS_LABELS[contact.status] || contact.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">{contact.source || '—'}</td>
                    <td className="p-4 text-slate-400 text-xs">
                      {new Date(contact.lastContactAt).toLocaleString('ru-RU')}
                    </td>
                    <td className="p-4 text-slate-400 text-xs max-w-xs truncate">
                      {contact.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <div className="text-2xl font-bold text-white">
                {contacts.filter((c) => c.status === status).length}
              </div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-white">{contacts.length}</div>
            <div className="text-xs text-slate-400">Всего</div>
          </div>
        </div>
      </div>
    </div>
  );
}
