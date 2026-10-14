'use client';

import React, { useEffect, useState } from 'react';
import { buildMaxLink } from '@/lib/messenger';

export interface Battery {
  id: number;
  name: string;
  serialNumber?: string | null;
  capacityAh?: number | string | null;
  voltage?: number | null;
  status: string; // FREE, RENTED, MAINTENANCE, BLOCKED
  pricePerDay: number | string;
  comment?: string | null;
}

export interface BatteryRentUser {
  id: number;
  name: string;
  phone: string;
  telegramChatId?: string | null;
  maxChatId?: string | null;
  preferredMessenger?: string | null;
}

export interface BatteryRent {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: number | string;
  status: string;
  paidTotal?: number;
  debt?: number;
  debtDueDate?: string | null;
  user: BatteryRentUser;
  battery: { id: number; name: string; serialNumber?: string | null; status: string };
}

interface BatterySectionProps {
  batteries: Battery[];
  rents: BatteryRent[];
  onChanged: () => void;
  onError: (msg: string | null) => void;
  onNotice: (msg: string | null) => void;
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Наличные',
  SBP: 'СБП',
  CARD: 'Карта',
  TRANSFER: 'Перевод',
};

const BATTERY_STATUS_LABELS: Record<string, string> = {
  FREE: 'Свободен',
  RENTED: 'В аренде',
  MAINTENANCE: 'Сервис',
  BLOCKED: 'Блок',
};

const BATTERY_STATUS_BADGE: Record<string, string> = {
  FREE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  RENTED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  MAINTENANCE: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  BLOCKED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatMoney(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

function toInputDate(dateString: string) {
  const d = new Date(dateString);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
}

export function BatterySection({ batteries, rents, onChanged, onError, onNotice }: BatterySectionProps) {
  const [rentName, setRentName] = useState('');
  const [rentPhone, setRentPhone] = useState('');
  const [rentBatteryId, setRentBatteryId] = useState('');
  const [rentDays, setRentDays] = useState('1');
  const [rentTotalPrice, setRentTotalPrice] = useState('');
  const [rentPriceManual, setRentPriceManual] = useState(false);
  const [rentSaving, setRentSaving] = useState(false);

  const [newName, setNewName] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [newVoltage, setNewVoltage] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newSaving, setNewSaving] = useState(false);

  const [payRent, setPayRent] = useState<BatteryRent | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payDue, setPayDue] = useState('');
  const [payBusy, setPayBusy] = useState(false);

  const freeBatteries = batteries.filter((b) => b.status === 'FREE');

  // Автоподсчёт стоимости: цена АКБ в сутки × дни (пока не тронуто вручную)
  useEffect(() => {
    if (rentPriceManual) return;
    const battery = freeBatteries.find((b) => String(b.id) === rentBatteryId);
    const days = Number(rentDays) || 0;
    setRentTotalPrice(battery && days > 0 ? String(Number(battery.pricePerDay) * days) : '');
  }, [rentBatteryId, rentDays, freeBatteries, rentPriceManual]);

  const submitBatteryRent = async () => {
    if (!rentName.trim() || !rentPhone.trim()) {
      onError('Укажите имя и телефон клиента');
      return;
    }
    if (!rentBatteryId) {
      onError('Выберите свободный аккумулятор');
      return;
    }
    const days = Number(rentDays);
    if (!days || days <= 0) {
      onError('Укажите корректный срок');
      return;
    }
    setRentSaving(true);
    try {
      const res = await fetch('/api/admin/battery-rents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: rentName.trim(),
          phone: rentPhone.trim(),
          batteryId: Number(rentBatteryId),
          days,
          totalPrice: rentTotalPrice ? Number(rentTotalPrice) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || 'Не удалось оформить аренду АКБ');
        return;
      }
      onNotice(`Аренда АКБ №${json.id} оформлена: ${rentName.trim()}`);
      setRentName('');
      setRentPhone('');
      setRentBatteryId('');
      setRentDays('1');
      setRentTotalPrice('');
      setRentPriceManual(false);
      onChanged();
    } catch {
      onError('Нет связи с сервером');
    } finally {
      setRentSaving(false);
    }
  };

  const submitNewBattery = async () => {
    if (!newName.trim()) {
      onError('Укажите название аккумулятора');
      return;
    }
    setNewSaving(true);
    try {
      const res = await fetch('/api/admin/batteries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          serialNumber: newSerial.trim() || null,
          capacityAh: newCapacity ? Number(newCapacity) : null,
          voltage: newVoltage ? Number(newVoltage) : null,
          pricePerDay: newPrice ? Number(newPrice) : 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || 'Не удалось добавить аккумулятор');
        return;
      }
      onNotice(`Аккумулятор «${json.name}» добавлен в парк`);
      setNewName('');
      setNewSerial('');
      setNewCapacity('');
      setNewVoltage('');
      setNewPrice('');
      onChanged();
    } catch {
      onError('Нет связи с сервером');
    } finally {
      setNewSaving(false);
    }
  };

  const patchBatteryStatus = async (battery: Battery, status: string) => {
    try {
      const res = await fetch(`/api/admin/batteries/${battery.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || 'Не удалось обновить статус АКБ');
        return;
      }
      onNotice(`«${battery.name}» → ${BATTERY_STATUS_LABELS[status] ?? status}`);
      onChanged();
    } catch {
      onError('Нет связи с сервером');
    }
  };

  const deleteBattery = async (battery: Battery) => {
    if (!window.confirm(`Удалить «${battery.name}» вместе с историей аренд?`)) return;
    try {
      const res = await fetch(`/api/admin/batteries/${battery.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || 'Не удалось удалить аккумулятор');
        return;
      }
      onNotice(`Аккумулятор «${battery.name}» удалён`);
      onChanged();
    } catch {
      onError('Нет связи с сервером');
    }
  };

  const patchBatteryRent = async (rentId: number, payload: Record<string, unknown>, notice: string) => {
    try {
      const res = await fetch(`/api/admin/battery-rents/${rentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || 'Не удалось обновить аренду АКБ');
        return null;
      }
      onNotice(notice);
      onChanged();
      return json;
    } catch {
      onError('Нет связи с сервером');
      return null;
    }
  };

  const completeRent = (rent: BatteryRent) => {
    if (!window.confirm(`Завершить аренду АКБ #${rent.id}? Аккумулятор станет свободным.`)) return;
    patchBatteryRent(rent.id, { status: 'COMPLETED' }, 'Аренда АКБ завершена, аккумулятор свободен');
  };

  const extendRent = (rent: BatteryRent) => {
    patchBatteryRent(rent.id, { extendDays: 1 }, `Аренда АКБ #${rent.id} продлена на 1 день`);
  };

  const openPay = (rent: BatteryRent) => {
    setPayRent(rent);
    setPayAmount(String(rent.debt ?? ''));
    setPayMethod('CASH');
    setPayDue(rent.debtDueDate ? toInputDate(rent.debtDueDate) : '');
    onError(null);
    onNotice(null);
  };

  const submitPay = async () => {
    if (!payRent) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      onError('Укажите корректную сумму оплаты');
      return;
    }
    setPayBusy(true);
    try {
      const res = await fetch(`/api/admin/battery-rents/${payRent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paidAmount: amount,
          paidMethod: payMethod,
          debtDueDate: payDue || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || 'Не удалось внести оплату');
        return;
      }
      let msg = `Оплата ${amount.toLocaleString('ru-RU')} ₽ внесена по аренде АКБ #${payRent.id}`;
      if (json.debt > 0) msg += `, остаток долга ${Number(json.debt).toLocaleString('ru-RU')} ₽`;
      if (json.overpaid) msg += ' (сумма превышала долг)';
      onNotice(msg);
      setPayRent(null);
      onChanged();
    } catch {
      onError('Нет связи с сервером');
    } finally {
      setPayBusy(false);
    }
  };

  return (
    <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">Аккумуляторы</h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Выдать АКБ в аренду</h3>
            {freeBatteries.length === 0 ? (
              <p className="text-slate-500 text-sm">Нет свободных аккумуляторов — добавьте в парк ниже</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Имя курьера</label>
                  <input
                    type="text"
                    value={rentName}
                    onChange={(e) => setRentName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                    placeholder="Иван"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Телефон</label>
                  <input
                    type="tel"
                    value={rentPhone}
                    onChange={(e) => setRentPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Аккумулятор</label>
                  <select
                    value={rentBatteryId}
                    onChange={(e) => {
                      setRentBatteryId(e.target.value);
                      setRentPriceManual(false);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">— выберите —</option>
                    {freeBatteries.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}{b.serialNumber ? ` (SN: ${b.serialNumber})` : ''} — {Number(b.pricePerDay)} ₽/сут
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Срок, дней</label>
                    <input
                      type="number"
                      min={1}
                      value={rentDays}
                      onChange={(e) => setRentDays(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Сумма, ₽</label>
                    <input
                      type="number"
                      min={0}
                      value={rentTotalPrice}
                      onChange={(e) => {
                        setRentPriceManual(true);
                        setRentTotalPrice(e.target.value);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={submitBatteryRent}
                    disabled={rentSaving}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {rentSaving ? 'Оформление...' : 'Оформить аренду АКБ'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Аренды АКБ ({rents.length})</h3>
            {rents.length === 0 ? (
              <p className="text-slate-500 text-sm">Активных аренд АКБ нет</p>
            ) : (
              <ul className="space-y-3">
                {rents.map((rent) => {
                  const overdue = new Date(rent.endDate) < new Date();
                  return (
                    <li
                      key={rent.id}
                      className={`border rounded-lg p-3 ${
                        overdue
                          ? 'bg-rose-950/20 border-rose-900'
                          : 'bg-slate-950/50 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-100">{rent.user.name}</p>
                          <p className="text-sm text-slate-400">{rent.user.phone}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {rent.battery.name}{rent.battery.serialNumber ? ` (SN: ${rent.battery.serialNumber})` : ''} · до {formatDate(rent.endDate)}
                            {overdue && (
                              <span className="ml-2 text-rose-400 font-medium">(просрочена)</span>
                            )}
                          </p>
                          {(rent.debt ?? 0) > 0 && ((rent.paidTotal ?? 0) > 0 || Boolean(rent.debtDueDate)) && (
                            <p className="text-xs mt-0.5 text-rose-400 font-medium">
                              Долг {formatMoney(Number(rent.debt))}
                              {rent.debtDueDate ? ` до ${formatDate(rent.debtDueDate)}` : ''}
                              {(rent.paidTotal ?? 0) > 0 && (
                                <span className="text-slate-500 font-normal">
                                  {' '}· внесено {formatMoney(Number(rent.paidTotal))}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap justify-end items-start">
                          <a
                            href={`tel:${rent.user.phone}`}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                          >
                            Позвонить
                          </a>
                          {buildMaxLink(rent.user) && (
                            <a
                              href={buildMaxLink(rent.user)!}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs transition-colors"
                            >
                              MAX
                            </a>
                          )}
                          {(rent.debt ?? 0) > 0 && ((rent.paidTotal ?? 0) > 0 || Boolean(rent.debtDueDate)) && (
                            <button
                              onClick={() => openPay(rent)}
                              className="px-2.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-xs transition-colors"
                            >
                              + Оплата
                            </button>
                          )}
                          <button
                            onClick={() => completeRent(rent)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs transition-colors"
                          >
                            Завершить
                          </button>
                          <button
                            onClick={() => extendRent(rent)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                          >
                            +1 день
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Парк АКБ ({batteries.length})</h3>

          {batteries.length === 0 ? (
            <p className="text-slate-500 text-sm mb-4">Аккумуляторов пока нет — добавьте первый ниже</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {batteries.map((b) => (
                <li
                  key={b.id}
                  className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate">
                      {b.name}
                      {b.serialNumber && (
                        <span className="text-slate-500 font-normal"> · SN {b.serialNumber}</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {[
                        b.voltage ? `${b.voltage}В` : null,
                        b.capacityAh ? `${Number(b.capacityAh)} Ah` : null,
                        `${Number(b.pricePerDay)} ₽/сут`,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${BATTERY_STATUS_BADGE[b.status] ?? 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                      {BATTERY_STATUS_LABELS[b.status] ?? b.status}
                    </span>
                    {b.status !== 'RENTED' && (
                      <>
                        {b.status !== 'FREE' && (
                          <button
                            type="button"
                            onClick={() => patchBatteryStatus(b, 'FREE')}
                            className="px-2 py-1 bg-slate-800 hover:bg-emerald-800 text-slate-300 rounded text-xs transition-colors"
                          >
                            Свободен
                          </button>
                        )}
                        {b.status !== 'MAINTENANCE' && (
                          <button
                            type="button"
                            onClick={() => patchBatteryStatus(b, 'MAINTENANCE')}
                            className="px-2 py-1 bg-slate-800 hover:bg-orange-800 text-slate-300 rounded text-xs transition-colors"
                          >
                            Сервис
                          </button>
                        )}
                        {b.status !== 'BLOCKED' && (
                          <button
                            type="button"
                            onClick={() => patchBatteryStatus(b, 'BLOCKED')}
                            className="px-2 py-1 bg-slate-800 hover:bg-rose-900 text-slate-300 rounded text-xs transition-colors"
                          >
                            Блок
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteBattery(b)}
                          className="px-2 py-1 bg-slate-800 hover:bg-rose-900 text-slate-300 rounded text-xs transition-colors"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Добавить аккумулятор</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="Название, напр. АКБ 60V 45Ah №2"
                />
              </div>
              <input
                type="text"
                value={newSerial}
                onChange={(e) => setNewSerial(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="Серийный номер (необяз.)"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min={0}
                  value={newVoltage}
                  onChange={(e) => setNewVoltage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="В"
                />
                <input
                  type="number"
                  min={0}
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="Ah"
                />
                <input
                  type="number"
                  min={0}
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="₽/сут"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={submitNewBattery}
                  disabled={newSaving}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {newSaving ? 'Добавляем...' : 'Добавить АКБ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {payRent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-2 text-lg font-semibold text-slate-100">
              Оплата по аренде АКБ #{payRent.id}
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              {payRent.user.name} · {payRent.battery.name} · долг {formatMoney(Number(payRent.debt ?? 0))}
            </p>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Сумма, ₽</label>
                <input
                  type="number"
                  min={0}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Способ</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {Object.entries(METHOD_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Срок погашения остатка (необяз.)</label>
                <input
                  type="date"
                  value={payDue}
                  onChange={(e) => setPayDue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitPay}
                disabled={payBusy}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {payBusy ? 'Проводим...' : 'Внести оплату'}
              </button>
              <button
                onClick={() => setPayRent(null)}
                disabled={payBusy}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-sm transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
