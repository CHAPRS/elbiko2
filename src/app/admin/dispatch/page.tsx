'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { LeadForm } from '@/components/admin/LeadForm';
import { MileagePrompt } from '@/components/admin/MileagePrompt';
import { BuyoutSection, Buyout } from '@/components/admin/BuyoutSection';
import { buildMaxLink } from '@/lib/messenger';

interface Stats {
  totalBikes: number;
  rentedBikes: number;
  freeBikes: number;
  maintenanceBikes: number;
  availableForRent: number;
  occupancyRate: number;
  totalUsers: number;
  newLeads: number;
  activeRents: number;
  overdueRents: number;
  returningToday: number;
  returningTomorrow: number;
  revenueToday: number;
  revenuePeriod: number;
  expectedRevenue: number;
  overdueRevenue: number;
  averageCheck: number;
  failedRefundedRevenue: number;
  miscIncomeToday: number;
  miscIncomePeriod: number;
  expensesToday: number;
  expensesPeriod: number;
  buyoutIncomeToday: number;
  buyoutIncomePeriod: number;
  netProfitPeriod: number;
  totalIncomeToday: number;
  totalIncomePeriod: number;
  pendingBuyoutTotal: number;
  incomeByMethod: Record<string, number>;
  expenseByCategory: Record<string, number>;
}

interface Bike {
  id: number;
  name: string;
  externalId?: string | null;
  status: string;
  pricePerDay: number;
  mileage?: number | null;
  serviceIntervalKm?: number | null;
  lastServiceMileage?: number | null;
}

interface Lead {
  id: number;
  name: string;
  phone: string;
  bikeName?: string | null;
  rentDays?: number | null;
  totalPrice?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  bike?: { id: number; name: string; externalId?: string | null } | null;
  bikeId?: number | null;
}

interface RentUser {
  id: number;
  name: string;
  phone: string;
  telegramChatId?: string | null;
  maxChatId?: string | null;
  preferredMessenger?: string | null;
}

interface RentBike {
  id: number;
  name: string;
  externalId?: string | null;
  status: string;
}

interface Rent {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  user: RentUser;
  bike: RentBike;
}

interface RevenueDay {
  date: string;
  revenue: number;
  misc?: number;
  expense?: number;
  buyout?: number;
  total?: number;
}

interface MiscTransaction {
  id: number;
  kind: string;
  title: string;
  amount: number;
  method?: string | null;
  category?: string | null;
  bikeId?: number | null;
  bike?: { id: number; name: string; externalId?: string | null } | null;
  comment?: string | null;
  createdAt: string;
}

interface TopBike {
  name: string;
  revenue: number;
}

interface TimelineDay {
  date: string;
  dayOfWeek: string;
  freeCount: number;
  returning: Rent[];
}

interface DashboardData {
  stats: Stats;
  newLeads: Lead[];
  activeRents: Rent[];
  overdueRents: Rent[];
  returningToday: Rent[];
  returningTomorrow: Rent[];
  freeBikes: Bike[];
  maintenanceBikes: Bike[];
  revenueByDay: RevenueDay[];
  topBikes: TopBike[];
  timeline: TimelineDay[];
  bikes: Bike[];
  recentMisc: MiscTransaction[];
  buyouts: Buyout[];
  archivedBuyouts?: Buyout[];
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatShortDay(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

function formatMoney(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Наличные',
  SBP: 'СБП',
  CARD: 'Карта',
  TRANSFER: 'Перевод',
};

const CATEGORY_LABELS: Record<string, string> = {
  REPAIR: 'Ремонт',
  SERVICE: 'ТО',
  BATTERY: 'Аккумулятор',
  BATTERY_RENT: 'Аренда аккумулятора',
  ACCESSORIES: 'Аксессуары',
  GOODS: 'Сопутствующие товары',
  OTHER: 'Прочее',
  NONE: 'Без категории',
};

const CATEGORY_ORDER = ['REPAIR', 'SERVICE', 'BATTERY', 'BATTERY_RENT', 'ACCESSORIES', 'GOODS', 'OTHER', 'NONE'];

const MISC_TITLE_SUGGESTIONS = [
  'Ремонт',
  'Аренда аккумулятора',
  'Сопутствующие товары',
  'Продажа',
  'Закупка байка',
  'Запчасти',
  'Обслуживание',
  'Прочее',
];

function ContactLinks({ user }: { user: RentUser }) {
  const maxLink = buildMaxLink(user);

  return (
    <div className="flex gap-2 shrink-0 flex-wrap">
      <a
        href={`tel:${user.phone}`}
        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
      >
        Позвонить
      </a>
      {maxLink && (
        <a
          href={maxLink}
          target="_blank"
          rel="noreferrer"
          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs transition-colors"
        >
          MAX
        </a>
      )}
    </div>
  );
}

export default function DispatchPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const [markingOverdue, setMarkingOverdue] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [convertBikeId, setConvertBikeId] = useState('');
  const [convertDays, setConvertDays] = useState('1');
  const [convertTotalPrice, setConvertTotalPrice] = useState('');
  const [convertPriceManual, setConvertPriceManual] = useState(false);
  const [converting, setConverting] = useState(false);
  const [miscKind, setMiscKind] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [miscTitle, setMiscTitle] = useState('');
  const [miscAmount, setMiscAmount] = useState('');
  const [miscMethod, setMiscMethod] = useState('CASH');
  const [miscCategory, setMiscCategory] = useState('');
  const [miscBikeId, setMiscBikeId] = useState('');
  const [miscComment, setMiscComment] = useState('');
  const [miscSaving, setMiscSaving] = useState(false);
  const [editingMisc, setEditingMisc] = useState<MiscTransaction | null>(null);
  const [mileageAction, setMileageAction] = useState<{ type: 'complete' | 'extend'; rent: Rent } | null>(null);
  const [mileageBike, setMileageBike] = useState<Bike | null>(null);
  const [mileageBusy, setMileageBusy] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchDashboard = useCallback(async (selectedDays: number, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?days=${selectedDays}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Не удалось загрузить дашборд');
        return;
      }
      setData(json);
      setError(null);
    } catch (err) {
      setError('Нет связи с сервером');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(days);

    const interval = setInterval(() => {
      fetchDashboard(days, true);
    }, 30000);

    return () => clearInterval(interval);
  }, [days, fetchDashboard]);

  const takeLead = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });
      if (res.ok) {
        setNotice('Заявка взята в работу');
        fetchDashboard(days);
      } else {
        const json = await res.json();
        setError(json.error || 'Не удалось обновить заявку');
      }
    } catch {
      setError('Нет связи с сервером');
    }
  };

  const openConvert = (lead: Lead) => {
    setConvertingLead(lead);
    setConvertPriceManual(false);
    const defaultBikeId = lead.bikeId
      ? String(lead.bikeId)
      : lead.bike
      ? String(lead.bike.id)
      : '';
    setConvertBikeId(defaultBikeId);
    const defaultDays = lead.rentDays && lead.rentDays > 0 ? String(lead.rentDays) : '1';
    setConvertDays(defaultDays);

    const bike = data?.freeBikes.find((b) => String(b.id) === defaultBikeId);
    const price =
      lead.totalPrice !== null && lead.totalPrice !== undefined
        ? String(lead.totalPrice)
        : bike
        ? String(Number(bike.pricePerDay) * Number(defaultDays))
        : '';
    setConvertTotalPrice(price);
  };

  const closeConvert = () => {
    setConvertingLead(null);
    setConvertBikeId('');
    setConvertDays('1');
    setConvertTotalPrice('');
    setConvertPriceManual(false);
    setConverting(false);
  };

  useEffect(() => {
    if (!convertingLead || convertPriceManual) return;
    const bike = data?.freeBikes.find((b) => String(b.id) === convertBikeId);
    if (!bike) return;
    const days = Number(convertDays) || 1;
    setConvertTotalPrice(String(Number(bike.pricePerDay) * days));
  }, [convertBikeId, convertDays, convertingLead, data?.freeBikes, convertPriceManual]);

  const handleConvert = async () => {
    if (!convertingLead) return;
    if (!convertBikeId) {
      setError('Выберите велосипед');
      return;
    }
    const rentDays = Number(convertDays);
    if (!rentDays || rentDays <= 0) {
      setError('Укажите корректное количество дней');
      return;
    }
    setConverting(true);
    try {
      const res = await fetch(`/api/admin/leads/${convertingLead.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bikeId: Number(convertBikeId),
          days: rentDays,
          totalPrice: convertTotalPrice ? Number(convertTotalPrice) : undefined,
          startDate: convertingLead.startDate,
          endDate: convertingLead.endDate,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Не удалось оформить аренду');
        return;
      }
      setNotice(`Аренда №${json.rentId} оформлена по заявке №${convertingLead.id}`);
      closeConvert();
      fetchDashboard(days);
    } catch {
      setError('Нет связи с сервером');
    } finally {
      setConverting(false);
    }
  };

  const completeRent = (rent: Rent) => {
    setMileageAction({ type: 'complete', rent });
  };

  const extendRent = (rent: Rent) => {
    setMileageAction({ type: 'extend', rent });
  };

  const submitRentMileage = async (mileage: number | null) => {
    if (!mileageAction) return;
    const { type, rent } = mileageAction;
    setMileageBusy(true);
    try {
      const body =
        type === 'complete'
          ? { status: 'COMPLETED' }
          : { extendDays: 1 };
      const res = await fetch(`/api/admin/rents/${rent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mileage !== null ? { ...body, mileage } : body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Не удалось обновить аренду');
        return;
      }
      setNotice(
        type === 'complete'
          ? 'Аренда завершена, байк освобожден'
          : 'Аренда продлена на 1 день'
      );
      if (json.mileageWarning) {
        setNotice((prev) => `${prev}. Внимание: внесённый пробег меньше предыдущего`);
      }
      setMileageAction(null);
      fetchDashboard(days);
    } catch {
      setError('Нет связи с сервером');
    } finally {
      setMileageBusy(false);
    }
  };

  const submitBikeMileage = async (mileage: number | null) => {
    if (!mileageBike) return;
    if (mileage === null) {
      setMileageBike(null);
      return;
    }
    setMileageBusy(true);
    try {
      const res = await fetch(`/api/admin/bikes/${mileageBike.id}/mileage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mileage }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Не удалось сохранить пробег');
        return;
      }
      setNotice(
        json.mileageWarning
          ? `Пробег ${mileage} км записан. Внимание: он меньше предыдущего`
          : `Пробег ${mileage} км записан для ${mileageBike.name}`
      );
      setMileageBike(null);
      fetchDashboard(days);
    } catch {
      setError('Нет связи с сервером');
    } finally {
      setMileageBusy(false);
    }
  };

  const markServiceDone = async (bike: Bike) => {
    if (bike.mileage == null) {
      setError('Сначала укажите текущий пробег байка');
      return;
    }
    try {
      const res = await fetch('/api/admin/bikes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bike.id, lastServiceMileage: bike.mileage }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Не удалось отметить ТО');
        return;
      }
      setNotice(`ТО проведено: ${bike.name} на ${bike.mileage.toLocaleString('ru-RU')} км`);
      fetchDashboard(days);
    } catch {
      setError('Нет связи с сервером');
    }
  };

  const serviceInfo = (bike: Bike): { text: string; overdue: boolean } | null => {
    if (bike.serviceIntervalKm == null || bike.serviceIntervalKm <= 0) return null;
    if (bike.mileage == null) return { text: 'Пробег не указан', overdue: false };
    const sinceLast = bike.mileage - (bike.lastServiceMileage ?? 0);
    const remaining = bike.serviceIntervalKm - sinceLast;
    return remaining <= 0
      ? { text: `ТО просрочено на ${Math.abs(remaining).toLocaleString('ru-RU')} км`, overdue: true }
      : { text: `до ТО ${remaining.toLocaleString('ru-RU')} км`, overdue: false };
  };

  const markOverdue = async () => {
    setMarkingOverdue(true);
    try {
      const res = await fetch('/api/admin/overdue', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Не удалось пометить просрочки');
        return;
      }
      setNotice(`Просрочено аренд: ${json.count}`);
      fetchDashboard(days);
    } catch {
      setError('Нет связи с сервером');
    } finally {
      setMarkingOverdue(false);
    }
  };

  const resetMiscForm = () => {
    setEditingMisc(null);
    setMiscKind('INCOME');
    setMiscTitle('');
    setMiscAmount('');
    setMiscMethod('CASH');
    setMiscCategory('');
    setMiscBikeId('');
    setMiscComment('');
  };

  const startEditMisc = (tx: MiscTransaction) => {
    setEditingMisc(tx);
    setMiscKind(tx.kind === 'EXPENSE' ? 'EXPENSE' : 'INCOME');
    setMiscTitle(tx.title);
    setMiscAmount(String(tx.amount));
    setMiscMethod(tx.method || 'CASH');
    setMiscCategory(tx.category || '');
    setMiscBikeId(tx.bikeId ? String(tx.bikeId) : '');
    setMiscComment(tx.comment || '');
  };

  const submitMisc = async () => {
    const amount = Number(miscAmount);
    if (!miscTitle.trim()) {
      setError('Укажите предмет операции');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Укажите корректную сумму');
      return;
    }
    setMiscSaving(true);
    try {
      const payload = {
        kind: miscKind,
        title: miscTitle.trim(),
        amount,
        method: miscMethod || null,
        category: miscCategory || null,
        bikeId: miscBikeId ? Number(miscBikeId) : null,
        comment: miscComment.trim() || null,
      };
      const res = await fetch(
        editingMisc ? `/api/admin/finance/${editingMisc.id}` : '/api/admin/finance',
        {
          method: editingMisc ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Не удалось сохранить операцию');
        return;
      }
      setNotice(editingMisc ? 'Операция обновлена' : 'Операция добавлена');
      resetMiscForm();
      fetchDashboard(days);
    } catch {
      setError('Нет связи с сервером');
    } finally {
      setMiscSaving(false);
    }
  };

  const deleteMisc = async (id: number) => {
    if (!window.confirm('Удалить эту операцию?')) return;
    try {
      const res = await fetch(`/api/admin/finance/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Не удалось удалить операцию');
        return;
      }
      if (editingMisc?.id === id) resetMiscForm();
      setNotice('Операция удалена');
      fetchDashboard(days);
    } catch {
      setError('Нет связи с сервером');
    }
  };

  const operationalStats: { label: string; value: number; color: string; suffix?: string }[] = data
    ? [
        { label: 'Новые заявки', value: data.stats.newLeads, color: 'text-emerald-400' },
        { label: 'Активные аренды', value: data.stats.activeRents, color: 'text-amber-400' },
        { label: 'Просроченные', value: data.stats.overdueRents, color: 'text-rose-400' },
        { label: 'Свободные байки', value: data.stats.freeBikes, color: 'text-cyan-400' },
        { label: 'Возврат сегодня', value: data.stats.returningToday, color: 'text-blue-400' },
        { label: 'Возврат завтра', value: data.stats.returningTomorrow, color: 'text-violet-400' },
        { label: 'Загруженность', value: data.stats.occupancyRate, color: 'text-amber-500', suffix: '%' },
        { label: 'Доступно для аренды', value: data.stats.availableForRent, color: 'text-emerald-300' },
      ]
    : [];

  const financialStats: { label: string; value: number; color: string }[] = data
    ? [
        { label: 'Выручка всего сегодня', value: data.stats.totalIncomeToday, color: 'text-emerald-400' },
        { label: `Выручка всего за ${days} дн.`, value: data.stats.totalIncomePeriod, color: 'text-amber-400' },
        { label: `Аренда за ${days} дн.`, value: data.stats.revenuePeriod, color: 'text-sky-400' },
        { label: 'Ожидаемая выручка', value: data.stats.expectedRevenue, color: 'text-cyan-400' },
        { label: 'Просроченная выручка', value: data.stats.overdueRevenue, color: 'text-rose-400' },
        { label: 'Средний чек', value: data.stats.averageCheck, color: 'text-slate-200' },
        { label: 'Неудачи / возвраты', value: data.stats.failedRefundedRevenue, color: 'text-slate-400' },
        { label: `Прочие доходы за ${days} дн.`, value: data.stats.miscIncomePeriod, color: 'text-emerald-300' },
        { label: `Доход по выкупам за ${days} дн.`, value: data.stats.buyoutIncomePeriod, color: 'text-cyan-300' },
        { label: `Расходы за ${days} дн.`, value: data.stats.expensesPeriod, color: 'text-rose-300' },
        { label: `Прибыль за ${days} дн.`, value: data.stats.netProfitPeriod, color: 'text-lime-400' },
        { label: 'Осталось по выкупам', value: data.stats.pendingBuyoutTotal, color: 'text-violet-400' },
      ]
    : [];

  const maxRevenue = data && data.revenueByDay.length > 0
    ? Math.max(...data.revenueByDay.map((d) => Math.max(d.total ?? 0, d.expense ?? 0)), 1)
    : 1;

  const query = searchQuery.toLowerCase().trim();

  const matchesSearch = (...values: (string | number | null | undefined)[]) => {
    if (!query) return true;
    return values.some((value) =>
      String(value ?? '').toLowerCase().includes(query)
    );
  };

  const filteredNewLeads = data?.newLeads.filter((lead) =>
    matchesSearch(lead.name, lead.phone, lead.bike?.name, lead.bikeName)
  ) ?? [];

  const filteredActiveRents = data?.activeRents.filter((rent) =>
    matchesSearch(rent.user.name, rent.user.phone, rent.bike.name)
  ) ?? [];

  const nowTs = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  type Debtor = {
    key: string;
    kind: 'Аренда' | 'Выкуп';
    name: string;
    phone?: string | null;
    target: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
  };
  const debtors: Debtor[] = [];

  (data?.activeRents ?? [])
    .filter((rent) =>
      new Date(rent.endDate).getTime() < nowTs &&
      matchesSearch(rent.user.name, rent.user.phone, rent.bike.name)
    )
    .forEach((rent) => {
      debtors.push({
        key: `rent-${rent.id}`,
        kind: 'Аренда',
        name: rent.user.name,
        phone: rent.user.phone,
        target: rent.bike.name + (rent.bike.externalId ? ` (ID: ${rent.bike.externalId})` : ''),
        amount: Number(rent.totalPrice) || 0,
        dueDate: rent.endDate,
        daysOverdue: Math.floor((nowTs - new Date(rent.endDate).getTime()) / DAY_MS),
      });
    });

  (data?.buyouts ?? [])
    .filter((b) => matchesSearch(b.clientName, b.clientPhone, b.title))
    .forEach((b) => {
      const overduePayments = b.payments.filter(
        (p) => p.status === 'PENDING' && new Date(p.dueDate).getTime() < nowTs
      );
      if (overduePayments.length === 0) return;
      const earliest = overduePayments.reduce((min, p) =>
        new Date(p.dueDate) < new Date(min) ? p.dueDate : min,
      overduePayments[0].dueDate);
      debtors.push({
        key: `buyout-${b.id}`,
        kind: 'Выкуп',
        name: b.clientName,
        phone: b.clientPhone,
        target: b.title,
        amount: overduePayments.reduce((s, p) => s + Number(p.amount), 0),
        dueDate: earliest,
        daysOverdue: Math.floor((nowTs - new Date(earliest).getTime()) / DAY_MS),
      });
    });

  debtors.sort((a, b) => b.daysOverdue - a.daysOverdue);
  const totalDebt = debtors.reduce((sum, d) => sum + d.amount, 0);

  const filteredReturningToday = data?.returningToday.filter((rent) =>
    matchesSearch(rent.user.name, rent.user.phone, rent.bike.name)
  ) ?? [];

  const filteredReturningTomorrow = data?.returningTomorrow.filter((rent) =>
    matchesSearch(rent.user.name, rent.user.phone, rent.bike.name)
  ) ?? [];

  const filteredFreeBikes = data?.freeBikes.filter((bike) =>
    matchesSearch(bike.name)
  ) ?? [];

  const filteredMaintenanceBikes = data?.maintenanceBikes.filter((bike) =>
    matchesSearch(bike.name)
  ) ?? [];

  const filteredTimeline = data?.timeline.filter((day) =>
    matchesSearch(day.date) ||
    day.returning.some((rent) =>
      matchesSearch(rent.user.name, rent.user.phone, rent.bike.name)
    )
  ) ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Диспетчерская
          </h1>
          <button
            onClick={markOverdue}
            disabled={markingOverdue}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {markingOverdue ? 'Проверка...' : 'Пометить просрочки'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchQuery(searchInput.trim());
                }
              }}
              placeholder="Поиск по имени, телефону, модели..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-4 pr-10 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                Сбросить
              </button>
            )}
          </div>
          <button
            onClick={() => setSearchQuery(searchInput.trim())}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Найти
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-pulse h-24"
                />
              ))
            : operationalStats.map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-4"
                >
                  <div className={`text-2xl font-bold ${item.color}`}>
                    {item.suffix ? `${Number(item.value).toFixed(1)}${item.suffix}` : item.value}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{item.label}</div>
                </div>
              ))}
        </div>

        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Новая заявка</h2>
          <LeadForm bikes={data?.freeBikes ?? []} onSuccess={() => fetchDashboard(days)} />
        </section>

        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Прочие операции</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMiscKind('INCOME')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    miscKind === 'INCOME'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Доход
                </button>
                <button
                  type="button"
                  onClick={() => setMiscKind('EXPENSE')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    miscKind === 'EXPENSE'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Расход
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Предмет</label>
                  <input
                    type="text"
                    list="misc-titles"
                    value={miscTitle}
                    onChange={(e) => setMiscTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                    placeholder="Например: ремонт, аренда аккумулятора"
                  />
                  <datalist id="misc-titles">
                    {MISC_TITLE_SUGGESTIONS.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Сумма, ₽</label>
                  <input
                    type="number"
                    min={0}
                    value={miscAmount}
                    onChange={(e) => setMiscAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Способ оплаты</label>
                  <select
                    value={miscMethod}
                    onChange={(e) => setMiscMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="CASH">Наличные</option>
                    <option value="SBP">СБП</option>
                    <option value="CARD">Карта</option>
                    <option value="TRANSFER">Перевод</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Категория</label>
                  <select
                    value={miscCategory}
                    onChange={(e) => setMiscCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">— без категории —</option>
                    <option value="REPAIR">Ремонт</option>
                    <option value="SERVICE">ТО</option>
                    <option value="BATTERY">Аккумулятор</option>
                    <option value="BATTERY_RENT">Аренда аккумулятора</option>
                    <option value="ACCESSORIES">Аксессуары</option>
                    <option value="GOODS">Сопутствующие товары</option>
                    <option value="OTHER">Прочее</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Байк (необязательно)</label>
                  <select
                    value={miscBikeId}
                    onChange={(e) => setMiscBikeId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">— без привязки —</option>
                    {(data?.bikes ?? []).map((bike) => (
                      <option key={bike.id} value={bike.id}>
                        {bike.name}{bike.externalId ? ` (ID: ${bike.externalId})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Комментарий</label>
                  <input
                    type="text"
                    value={miscComment}
                    onChange={(e) => setMiscComment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                    placeholder="Доп. информация"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={submitMisc}
                  disabled={miscSaving}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {miscSaving ? 'Сохраняем...' : editingMisc ? 'Сохранить изменения' : 'Добавить операцию'}
                </button>
                {editingMisc && (
                  <button
                    type="button"
                    onClick={resetMiscForm}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
                  >
                    Отмена
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Последние операции</h3>
              {loading ? (
                <p className="text-slate-400 text-sm">Загрузка...</p>
              ) : !data || data.recentMisc.length === 0 ? (
                <p className="text-slate-400 text-sm">Операций пока нет</p>
              ) : (
                <ul className="space-y-2">
                  {data.recentMisc.map((tx) => (
                    <li
                      key={tx.id}
                      className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">
                          {tx.title}
                          {tx.bike && (
                            <span className="text-slate-400 font-normal">
                              {' '}· {tx.bike.name}{tx.bike.externalId ? ` (ID: ${tx.bike.externalId})` : ''}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDateTime(tx.createdAt)}
                          {tx.category ? ` · ${CATEGORY_LABELS[tx.category] || tx.category}` : ''}
                          {tx.method ? ` · ${METHOD_LABELS[tx.method] || tx.method}` : ''}
                          {tx.comment ? ` · ${tx.comment}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-sm font-semibold ${
                            tx.kind === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.kind === 'INCOME' ? '+' : '−'}{formatMoney(Number(tx.amount))}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEditMisc(tx)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                        >
                          Изм.
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMisc(tx.id)}
                          className="px-2 py-1 bg-slate-800 hover:bg-rose-900 text-slate-300 rounded text-xs transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <BuyoutSection
          buyouts={data?.buyouts ?? []}
          archivedBuyouts={data?.archivedBuyouts ?? []}
          bikes={data?.bikes ?? []}
          onChanged={() => fetchDashboard(days)}
          onError={setError}
          onNotice={setNotice}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200">Новые заявки</h2>
              <Link
                href="/admin/leads"
                className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
              >
                Все заявки
              </Link>
            </div>

            {loading ? (
              <p className="text-slate-400 text-sm">Загрузка...</p>
            ) : filteredNewLeads.length === 0 ? (
              <p className="text-slate-400 text-sm">Новых заявок нет</p>
            ) : (
              <ul className="space-y-3">
                {filteredNewLeads.map((lead) => (
                  <li
                    key={lead.id}
                    className="border border-slate-800 rounded-lg p-3 bg-slate-950/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-100">{lead.name}</p>
                        <p className="text-sm text-slate-400">{lead.phone}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {lead.bike
                            ? `${lead.bike.name}${lead.bike.externalId ? ` (ID: ${lead.bike.externalId})` : ''}`
                            : (lead.bikeName || 'Байк не выбран')} · {formatDateTime(lead.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                        <button
                          onClick={() => takeLead(lead.id)}
                          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs transition-colors"
                        >
                          В работу
                        </button>
                        <button
                          onClick={() => openConvert(lead)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs transition-colors"
                        >
                          Оформить
                        </button>
                        <Link
                          href="/admin/leads"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                        >
                          Открыть
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200">Активные и просроченные аренды</h2>
              <Link
                href="/admin/rents"
                className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
              >
                Все аренды
              </Link>
            </div>

            {loading ? (
              <p className="text-slate-400 text-sm">Загрузка...</p>
            ) : filteredActiveRents.length === 0 ? (
              <p className="text-slate-400 text-sm">Активных аренд нет</p>
            ) : (
              <ul className="space-y-3">
                {filteredActiveRents.map((rent) => {
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
                            {rent.bike.name}{rent.bike.externalId ? ` (ID: ${rent.bike.externalId})` : ''} · до {formatDate(rent.endDate)}
                            {overdue && (
                              <span className="ml-2 text-rose-400 font-medium">(просрочена)</span>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap justify-end items-start">
                          <ContactLinks user={rent.user} />
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
          </section>
        </div>

        <section className={`border rounded-xl p-6 mb-8 ${
          debtors.length > 0
            ? 'bg-rose-950/20 border-rose-900/60'
            : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-200">Должники</h2>
            {debtors.length > 0 && (
              <span className="text-sm font-semibold text-rose-400">
                Итого долг: {formatMoney(totalDebt)}
              </span>
            )}
          </div>

          {loading ? (
            <p className="text-slate-400 text-sm">Загрузка...</p>
          ) : debtors.length === 0 ? (
            <p className="text-slate-400 text-sm">Просроченных долгов нет</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase border-b border-slate-800">
                    <th className="pb-2 pr-4 font-medium">Тип</th>
                    <th className="pb-2 pr-4 font-medium">Клиент</th>
                    <th className="pb-2 pr-4 font-medium">Предмет</th>
                    <th className="pb-2 pr-4 font-medium">Срок был</th>
                    <th className="pb-2 pr-4 font-medium">Просрочено</th>
                    <th className="pb-2 font-medium text-right">Долг</th>
                  </tr>
                </thead>
                <tbody>
                  {debtors.map((d) => (
                    <tr key={d.key} className="border-b border-slate-800/60 last:border-0">
                      <td className="py-2.5 pr-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          d.kind === 'Аренда'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-cyan-500/15 text-cyan-400'
                        }`}>
                          {d.kind}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="text-slate-100 font-medium">{d.name}</span>
                        {d.phone && <span className="block text-xs text-slate-400">{d.phone}</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-300">{d.target}</td>
                      <td className="py-2.5 pr-4 text-slate-400 whitespace-nowrap">{formatDate(d.dueDate)}</td>
                      <td className="py-2.5 pr-4 text-rose-400 font-medium whitespace-nowrap">
                        {d.daysOverdue} дн.
                      </td>
                      <td className="py-2.5 text-right text-rose-300 font-semibold whitespace-nowrap">
                        {formatMoney(d.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Возвращаются сегодня</h2>
            {loading ? (
              <p className="text-slate-400 text-sm">Загрузка...</p>
            ) : filteredReturningToday.length === 0 ? (
              <p className="text-slate-400 text-sm">Сегодня никто не возвращается</p>
            ) : (
              <ul className="space-y-3">
                {filteredReturningToday.map((rent) => (
                  <li
                    key={rent.id}
                    className="border border-slate-800 rounded-lg p-3 bg-slate-950/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-100">{rent.user.name}</p>
                        <p className="text-sm text-slate-400">{rent.user.phone}</p>
                        <p className="text-xs text-slate-500 mt-1">{rent.bike.name}{rent.bike.externalId ? ` (ID: ${rent.bike.externalId})` : ''} · {formatDate(rent.endDate)}</p>
                      </div>
                      <ContactLinks user={rent.user} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Возвращаются завтра</h2>
            {loading ? (
              <p className="text-slate-400 text-sm">Загрузка...</p>
            ) : filteredReturningTomorrow.length === 0 ? (
              <p className="text-slate-400 text-sm">Завтра никто не возвращается</p>
            ) : (
              <ul className="space-y-3">
                {filteredReturningTomorrow.map((rent) => (
                  <li
                    key={rent.id}
                    className="border border-slate-800 rounded-lg p-3 bg-slate-950/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-100">{rent.user.name}</p>
                        <p className="text-sm text-slate-400">{rent.user.phone}</p>
                        <p className="text-xs text-slate-500 mt-1">{rent.bike.name}{rent.bike.externalId ? ` (ID: ${rent.bike.externalId})` : ''} · {formatDate(rent.endDate)}</p>
                      </div>
                      <ContactLinks user={rent.user} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Таймлайн загруженности на 14 дней</h2>
          {loading ? (
            <p className="text-slate-400 text-sm">Загрузка...</p>
          ) : filteredTimeline.length === 0 ? (
            <p className="text-slate-400 text-sm">Нет данных</p>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max">
                {filteredTimeline.map((day) => (
                  <div
                    key={day.date}
                    className="min-w-[12rem] max-w-[12rem] bg-slate-950/50 border border-slate-800 rounded-lg p-3 flex flex-col"
                  >
                    <div className="text-sm font-medium text-slate-200 mb-1">
                      {day.dayOfWeek}, {formatShortDay(day.date)}
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 mb-1">{day.freeCount}</div>
                    <div className="text-xs text-slate-500 mb-3">свободных байков</div>
                    {day.returning.length > 0 && (
                      <div className="mt-auto">
                        <div className="text-xs font-medium text-amber-400 mb-1">
                          Возвратов: {day.returning.length}
                        </div>
                        <ul className="space-y-1 text-xs text-slate-400">
                          {day.returning.slice(0, 3).map((rent) => (
                            <li key={rent.id} className="truncate">
                              {rent.bike.name}{rent.bike.externalId ? ` (ID: ${rent.bike.externalId})` : ''} · {rent.user.name}
                            </li>
                          ))}
                          {day.returning.length > 3 && (
                            <li className="text-slate-500">+{day.returning.length - 3}</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {day.returning.length === 0 && (
                      <div className="mt-auto text-xs text-slate-600">Без возвратов</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-200">Финансы</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setDays(7)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  days === 7
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                7 дней
              </button>
              <button
                onClick={() => setDays(30)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  days === 30
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                30 дней
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 animate-pulse h-20"
                  />
                ))
              : financialStats.map((item) => (
                  <div
                    key={item.label}
                    className="bg-slate-950/50 border border-slate-800 rounded-xl p-4"
                  >
                    <div className={`text-xl font-bold ${item.color}`}>{formatMoney(item.value)}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.label}</div>
                  </div>
                ))}
          </div>

          {data && (Object.keys(data.stats.incomeByMethod).length > 0 || Object.keys(data.stats.expenseByCategory ?? {}).length > 0) && (
            <div className="mb-8 bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-4">
              {Object.keys(data.stats.incomeByMethod).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">Доходы по способам оплаты за {days} дн.</h3>
                  <div className="flex flex-wrap gap-3">
                    {['CASH', 'SBP', 'CARD', 'TRANSFER', 'NONE']
                      .filter((m) => (data.stats.incomeByMethod[m] ?? 0) > 0)
                      .map((m) => (
                        <div
                          key={m}
                          className="flex items-center gap-2 bg-slate-900/70 border border-slate-800 rounded-lg px-4 py-2"
                        >
                          <span className="text-xs text-slate-400">
                            {m === 'NONE' ? 'Без указания' : (METHOD_LABELS[m] ?? m)}
                          </span>
                          <span className="text-sm font-bold text-emerald-400">
                            {formatMoney(data.stats.incomeByMethod[m])}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {Object.keys(data.stats.expenseByCategory ?? {}).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">Расходы по категориям за {days} дн.</h3>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORY_ORDER
                      .filter((c) => (data.stats.expenseByCategory[c] ?? 0) > 0)
                      .map((c) => (
                        <div
                          key={c}
                          className="flex items-center gap-2 bg-slate-900/70 border border-slate-800 rounded-lg px-4 py-2"
                        >
                          <span className="text-xs text-slate-400">{CATEGORY_LABELS[c] ?? c}</span>
                          <span className="text-sm font-bold text-rose-400">
                            {formatMoney(data.stats.expenseByCategory[c])}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-950/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-sm font-semibold text-slate-200">Выручка по дням</h3>
                <div className="flex gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Всего
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-500" /> Аренда
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Прочие доходы
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" /> Выкупы
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Расходы
                  </span>
                </div>
              </div>

              {loading ? (
                <p className="text-slate-400 text-sm">Загрузка...</p>
              ) : data && data.revenueByDay.length === 0 ? (
                <p className="text-slate-400 text-sm">Нет данных за период</p>
              ) : (
                <div className="space-y-2">
                  {data?.revenueByDay.map((day) => (
                    <div key={day.date} className="flex items-center gap-3 text-sm">
                      <div className="w-14 shrink-0 text-xs text-slate-400">{formatShortDay(day.date)}</div>
                      <div className="flex-1">
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${((day.total ?? 0) / maxRevenue) * 100}%` }}
                          />
                        </div>
                        {((day.revenue ?? 0) > 0 || (day.misc ?? 0) > 0 || (day.expense ?? 0) > 0 || (day.buyout ?? 0) > 0) && (
                          <div className="mt-1 space-y-0.5">
                            {(day.revenue ?? 0) > 0 && (
                              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-sky-500 rounded-full"
                                  style={{ width: `${((day.revenue ?? 0) / maxRevenue) * 100}%` }}
                                />
                              </div>
                            )}
                            {(day.misc ?? 0) > 0 && (
                              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${((day.misc ?? 0) / maxRevenue) * 100}%` }}
                                />
                              </div>
                            )}
                            {(day.buyout ?? 0) > 0 && (
                              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-cyan-500 rounded-full"
                                  style={{ width: `${((day.buyout ?? 0) / maxRevenue) * 100}%` }}
                                />
                              </div>
                            )}
                            {(day.expense ?? 0) > 0 && (
                              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-rose-500 rounded-full"
                                  style={{ width: `${((day.expense ?? 0) / maxRevenue) * 100}%` }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="w-24 text-right text-xs text-slate-200 font-medium">
                        {formatMoney(day.total ?? 0)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Топ байков по доходу</h3>

              {loading ? (
                <p className="text-slate-400 text-sm">Загрузка...</p>
              ) : data && data.topBikes.length === 0 ? (
                <p className="text-slate-400 text-sm">Нет завершённых аренд</p>
              ) : (
                <ul className="space-y-3">
                  {data?.topBikes.map((bike, index) => (
                    <li key={bike.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-slate-200">{bike.name}</span>
                      </div>
                      <span className="font-medium text-amber-500">{formatMoney(bike.revenue)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Свободный транспорт</h2>
            {loading ? (
              <p className="text-slate-400 text-sm">Загрузка...</p>
            ) : filteredFreeBikes.length === 0 ? (
              <p className="text-slate-400 text-sm">Нет свободных байков</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredFreeBikes.map((bike) => {
                  const svc = serviceInfo(bike);
                  return (
                    <li
                      key={bike.id}
                      className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-100">{bike.name}{bike.externalId ? ` (ID: ${bike.externalId})` : ''}</p>
                          <p className="text-slate-400">{Number(bike.pricePerDay)} ₽/сут</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Пробег: {bike.mileage != null ? `${bike.mileage.toLocaleString('ru-RU')} км` : '—'}
                          </p>
                          {svc && (
                            <p className={`text-xs mt-0.5 ${svc.overdue ? 'text-rose-400 font-medium' : 'text-slate-500'}`}>
                              {svc.text}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setMileageBike(bike)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                          >
                            Пробег
                          </button>
                          {bike.serviceIntervalKm != null && bike.serviceIntervalKm > 0 && (
                            <button
                              type="button"
                              onClick={() => markServiceDone(bike)}
                              className="px-2 py-1 bg-slate-800 hover:bg-emerald-800 text-slate-300 rounded text-xs transition-colors"
                            >
                              ТО проведено
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">На сервисе</h2>
            {loading ? (
              <p className="text-slate-400 text-sm">Загрузка...</p>
            ) : filteredMaintenanceBikes.length === 0 ? (
              <p className="text-slate-400 text-sm">Нет байков на сервисе</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredMaintenanceBikes.map((bike) => {
                  const svc = serviceInfo(bike);
                  return (
                    <li
                      key={bike.id}
                      className="border border-slate-800 rounded-lg p-3 bg-slate-950/50 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-100">{bike.name}{bike.externalId ? ` (ID: ${bike.externalId})` : ''}</p>
                          <p className="text-slate-400">{Number(bike.pricePerDay)} ₽/сут</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Пробег: {bike.mileage != null ? `${bike.mileage.toLocaleString('ru-RU')} км` : '—'}
                          </p>
                          {svc && (
                            <p className={`text-xs mt-0.5 ${svc.overdue ? 'text-rose-400 font-medium' : 'text-slate-500'}`}>
                              {svc.text}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setMileageBike(bike)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                          >
                            Пробег
                          </button>
                          {bike.serviceIntervalKm != null && bike.serviceIntervalKm > 0 && (
                            <button
                              type="button"
                              onClick={() => markServiceDone(bike)}
                              className="px-2 py-1 bg-slate-800 hover:bg-emerald-800 text-slate-300 rounded text-xs transition-colors"
                            >
                              ТО проведено
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      {convertingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-2 text-lg font-semibold text-slate-100">
              Оформить аренду по заявке #{convertingLead.id}
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              {convertingLead.name} · {convertingLead.phone}
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-1">Велосипед</label>
              <select
                value={convertBikeId}
                onChange={(e) => setConvertBikeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="">— выберите —</option>
                {data?.freeBikes.map((bike) => (
                  <option key={bike.id} value={bike.id}>
                    {bike.name}{bike.externalId ? ` (ID: ${bike.externalId})` : ''} — {Number(bike.pricePerDay)} ₽/сут
                  </option>
                ))}
                {convertingLead.bikeId && !data?.freeBikes.some((b) => b.id === convertingLead.bikeId) && convertingLead.bike && (
                  <option value={convertingLead.bike.id}>
                    {convertingLead.bike.name}{convertingLead.bike.externalId ? ` (ID: ${convertingLead.bike.externalId})` : ''} — текущий выбор
                  </option>
                )}
              </select>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Срок, дней</label>
                <input
                  type="number"
                  min={1}
                  value={convertDays}
                  onChange={(e) => setConvertDays(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Стоимость, ₽</label>
                <input
                  type="number"
                  min={0}
                  value={convertTotalPrice}
                  onChange={(e) => {
                    setConvertPriceManual(true);
                    setConvertTotalPrice(e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConvert}
                disabled={converting}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {converting ? 'Оформление...' : 'Оформить аренду'}
              </button>
              <button
                onClick={closeConvert}
                disabled={converting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-sm transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {mileageAction && (
        <MileagePrompt
          title={
            mileageAction.type === 'complete'
              ? `Завершение аренды #${mileageAction.rent.id}`
              : `Продление аренды #${mileageAction.rent.id}`
          }
          subtitle={`${mileageAction.rent.user.name} · ${mileageAction.rent.bike.name}${mileageAction.rent.bike.externalId ? ` (ID: ${mileageAction.rent.bike.externalId})` : ''}`}
          currentMileage={
            data?.bikes?.find((b) => b.id === mileageAction.rent.bike.id)?.mileage ?? null
          }
          busy={mileageBusy}
          onSubmit={submitRentMileage}
          onCancel={() => !mileageBusy && setMileageAction(null)}
        />
      )}

      {mileageBike && (
        <MileagePrompt
          title={`Пробег: ${mileageBike.name}${mileageBike.externalId ? ` (ID: ${mileageBike.externalId})` : ''}`}
          currentMileage={mileageBike.mileage ?? null}
          busy={mileageBusy}
          onSubmit={submitBikeMileage}
          onCancel={() => !mileageBusy && setMileageBike(null)}
        />
      )}
    </div>
  );
}
