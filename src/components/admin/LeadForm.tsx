'use client';

import React, { useEffect, useState } from 'react';

interface BikeOption {
  id: number;
  name: string;
  pricePerDay: number;
}

interface LeadFormProps {
  bikes: BikeOption[];
  onSuccess: () => void;
}

export function LeadForm({ bikes, onSuccess }: LeadFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bikeId, setBikeId] = useState('');
  const [rentDays, setRentDays] = useState('1');
  const [totalPrice, setTotalPrice] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (bikes.length > 0 && !bikeId) {
      setBikeId(String(bikes[0].id));
    }
  }, [bikes, bikeId]);

  useEffect(() => {
    const bike = bikes.find((b) => b.id === Number(bikeId));
    const days = Number(rentDays);
    if (bike && days > 0) {
      const computed = Number(bike.pricePerDay) * days;
      setTotalPrice(String(Math.round(computed)));
    }
  }, [bikeId, rentDays, bikes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const days = Number(rentDays);
    const price = Number(totalPrice);

    if (!name || !phone || !bikeId || days <= 0 || price < 0) {
      setFormError('Заполните имя, телефон, байк, срок и сумму');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          bikeId: Number(bikeId),
          rentDays: days,
          totalPrice: price,
          message: message.trim() || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error || 'Не удалось создать заявку');
        return;
      }

      setName('');
      setPhone('');
      setBikeId(bikes.length > 0 ? String(bikes[0].id) : '');
      setRentDays('1');
      setTotalPrice('');
      setMessage('');
      onSuccess();
    } catch {
      setFormError('Нет связи с сервером');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="px-3 py-2 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Имя курьера</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="Иван"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Телефон</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="+7 (999) 123-45-67"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Байк</label>
          <select
            value={bikeId}
            onChange={(e) => setBikeId(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            {bikes.length === 0 && <option value="">Нет свободных байков</option>}
            {bikes.map((bike) => (
              <option key={bike.id} value={bike.id}>
                {bike.name} — {Number(bike.pricePerDay)} ₽/сут
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
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Итоговая сумма, ₽</label>
          <input
            type="number"
            min="0"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Автоподсчёт от прайса. Можно отредактировать вручную.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Комментарий</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="Доп. информация"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || bikes.length === 0}
        className="w-full md:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {saving ? 'Сохраняем...' : 'Создать заявку'}
      </button>
    </form>
  );
}
