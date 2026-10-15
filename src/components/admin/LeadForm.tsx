'use client';

import React, { useEffect, useState } from 'react';

interface BikeOption {
  id: number;
  name: string;
  externalId?: string | null;
  pricePerDay: number;
}

interface BatteryOption {
  id: number;
  name: string;
  serialNumber?: string | null;
  pricePerDay: number | string;
}

interface LeadFormProps {
  bikes: BikeOption[];
  batteries?: BatteryOption[];
  onSuccess: () => void;
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24)) + 1);
}

interface Contact {
  id: number;
  firstName: string | null;
  lastName: string | null;
  phone: string;
}

export function LeadForm({ bikes, batteries = [], onSuccess }: LeadFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [contactResults, setContactResults] = useState<Contact[]>([]);
  const [itemType, setItemType] = useState<'BIKE' | 'BATTERY'>('BIKE');
  const [bikeId, setBikeId] = useState('');
  const [batteryId, setBatteryId] = useState('');
  const [startDate, setStartDate] = useState(toISODate(new Date()));
  const [endDate, setEndDate] = useState(toISODate(new Date()));
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
    if (batteries.length > 0 && !batteryId) {
      setBatteryId(String(batteries[0].id));
    }
  }, [batteries, batteryId]);

  useEffect(() => {
    const days = daysBetween(startDate, endDate);
    setRentDays(String(days));

    if (itemType === 'BATTERY') {
      const battery = batteries.find((b) => b.id === Number(batteryId));
      if (battery && days > 0) {
        const computed = Number(battery.pricePerDay) * days;
        setTotalPrice(String(Math.round(computed)));
      }
      return;
    }

    const bike = bikes.find((b) => b.id === Number(bikeId));
    if (bike && days > 0) {
      const computed = Number(bike.pricePerDay) * days;
      setTotalPrice(String(Math.round(computed)));
    }
  }, [bikeId, batteryId, itemType, startDate, endDate, bikes, batteries]);

  // Автозаполнение ФИО по телефону из базы контактов
  useEffect(() => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || name) return;

    fetch(`/api/admin/contacts?phone=${encodeURIComponent(phone)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((contacts) => {
        const contact = contacts[0];
        if (contact) {
          const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
          if (fullName) setName(fullName);
        }
      })
      .catch(() => {});
  }, [phone, name]);

  // Поиск контакта по имени или телефону
  useEffect(() => {
    const q = contactSearch.trim();
    if (q.length < 3) {
      setContactResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetch(`/api/admin/contacts?q=${encodeURIComponent(q)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((contacts) => {
          setContactResults(Array.isArray(contacts) ? contacts.slice(0, 8) : []);
        })
        .catch(() => setContactResults([]));
    }, 300);

    return () => clearTimeout(timeout);
  }, [contactSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const days = Number(rentDays);
    const price = Number(totalPrice);
    const isBattery = itemType === 'BATTERY';

    if (!name || !phone || (isBattery ? !batteryId : !bikeId) || days <= 0 || price < 0) {
      setFormError(`Заполните имя, телефон, ${isBattery ? 'АКБ' : 'байк'}, срок и сумму`);
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setFormError('Дата окончания не может быть раньше даты начала');
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
          itemType,
          bikeId: isBattery ? null : Number(bikeId),
          batteryId: isBattery ? Number(batteryId) : null,
          rentDays: days,
          totalPrice: price,
          message: message.trim() || null,
          startDate,
          endDate,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error || 'Не удалось создать заявку');
        return;
      }

      setName('');
      setPhone('');
      setItemType('BIKE');
      setBikeId(bikes.length > 0 ? String(bikes[0].id) : '');
      setBatteryId(batteries.length > 0 ? String(batteries[0].id) : '');
      setStartDate(toISODate(new Date()));
      setEndDate(toISODate(new Date()));
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

      <div className="relative">
        <label className="block text-xs font-medium text-slate-400 mb-1">Найти контакт</label>
        <input
          type="text"
          value={contactSearch}
          onChange={(e) => setContactSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          placeholder="Введите имя или телефон"
        />
        {contactResults.length > 0 && contactSearch.trim().length >= 3 && (
          <ul className="absolute z-10 w-full bg-slate-900 border border-slate-800 rounded-lg mt-1 max-h-48 overflow-auto">
            {contactResults.map((c) => (
              <li
                key={c.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ');
                  setName(fullName);
                  setPhone(c.phone);
                  setContactSearch('');
                  setContactResults([]);
                }}
                className="px-3 py-2 hover:bg-slate-800 cursor-pointer text-sm text-slate-200"
              >
                {[c.firstName, c.lastName].filter(Boolean).join(' ')} — {c.phone}
              </li>
            ))}
          </ul>
        )}
      </div>

      {batteries.length > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setItemType('BIKE')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              itemType === 'BIKE'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Байк
          </button>
          <button
            type="button"
            onClick={() => setItemType('BATTERY')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              itemType === 'BATTERY'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Аккумулятор
          </button>
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
          <label className="block text-xs font-medium text-slate-400 mb-1">
            {itemType === 'BATTERY' ? 'Аккумулятор' : 'Байк'}
          </label>
          {itemType === 'BATTERY' ? (
            <select
              value={batteryId}
              onChange={(e) => setBatteryId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              {batteries.length === 0 && <option value="">Нет свободных АКБ</option>}
              {batteries.map((battery) => (
                <option key={battery.id} value={battery.id}>
                  {battery.name}{battery.serialNumber ? ` / SN: ${battery.serialNumber}` : ''} — {Number(battery.pricePerDay)} ₽/сут
                </option>
              ))}
            </select>
          ) : (
            <select
              value={bikeId}
              onChange={(e) => setBikeId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              {bikes.length === 0 && <option value="">Нет свободных байков</option>}
              {bikes.map((bike) => {
                const externalLabel = bike.externalId ? ` / ID: ${bike.externalId}` : '';
                return (
                  <option key={bike.id} value={bike.id}>
                    {bike.name}{externalLabel} — {Number(bike.pricePerDay)} ₽/сут
                  </option>
                );
              })}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Начало</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Окончание</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Срок, дней</label>
          <input
            type="number"
            min="1"
            value={rentDays}
            readOnly
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 focus:outline-none"
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

        <div className="md:col-span-2">
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
        disabled={saving || (itemType === 'BATTERY' ? batteries.length === 0 : bikes.length === 0)}
        className="w-full md:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {saving ? 'Сохраняем...' : 'Создать заявку'}
      </button>
    </form>
  );
}
