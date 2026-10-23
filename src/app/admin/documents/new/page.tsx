'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DOC_COMPONENTS,
  DOC_KIND_LABELS,
  DocKind,
  DocItemType,
} from '@/components/admin/documents/DocTemplates';
import { DOC_CSS } from '@/lib/docCss';
import { printDocHtml } from '@/lib/docPrint';
import { numToWordsRu, parseMoney } from '@/lib/num2words';

interface Prefill {
  itemType: DocItemType;
  rent: {
    id: number;
    status: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    createdAt: string;
  };
  user: {
    id: number;
    name: string;
    phone: string;
    passport: string | null;
    passportIssued: string | null;
    birthDate: string | null;
    address: string | null;
  };
  item: {
    name: string;
    externalId: string | null;
    serialNumber: string | null;
    mileage: number | null;
    voltage: number | null;
    capacityAh: number | null;
    pricePerDay: number;
  };
  numbers: { contract: number; extension: number };
  dates: {
    today: { day: string; month: string };
    start: { day: string; month: string };
    end: { day: string; month: string };
    created: { day: string; month: string };
  };
}

const VALID_KINDS: DocKind[] = ['CONTRACT', 'HANDOVER_ACT', 'RETURN_ACT', 'EXTENSION'];

// Снапшот заполненного бланка: инпуты → текст, чекбоксы → ☑/☐
function serialize(container: HTMLElement): string {
  const clone = container.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('input.doc-field, textarea.doc-field').forEach((el) => {
    const input = el as HTMLInputElement;
    const span = document.createElement('span');
    if (input.type === 'checkbox') {
      span.textContent = input.checked ? '☑ ' : '☐ ';
    } else {
      span.textContent = input.value || '________';
      span.style.whiteSpace = 'pre-wrap';
    }
    el.replaceWith(span);
  });
  return clone.innerHTML;
}

function buildDefaults(p: Prefill, kind: DocKind): Record<string, string> {
  const v: Record<string, string> = {
    tenantName: p.user.name,
    tenantName2: p.user.name,
    phone: p.user.phone,
    address: p.user.address ?? '',
    birthDate: p.user.birthDate ?? '',
    passportIssued: p.user.passportIssued ?? '',
    docDay: p.dates.today.day,
    docMonth: p.dates.today.month,
    contractNumber: String(p.numbers.contract),
    contractDay: p.dates.start.day,
    contractMonth: p.dates.start.month,
    model: p.item.name,
    invNumber: p.item.externalId ?? '',
    itemDesc: p.item.externalId
      ? `${p.item.name}, инв. № ${p.item.externalId}`
      : p.item.name,
  };
  // «серия ___ № ___» — паспорт храним одной строкой, раскладываем на серию/номер
  if (p.user.passport) {
    const m = p.user.passport.match(/^(\d{4})\s*(.*)$/);
    if (m) {
      v.passportSeries = m[1];
      v.passportNumber = m[2];
    } else {
      v.passportNumber = p.user.passport;
    }
  }
  if (kind === 'CONTRACT') {
    v.docNumber = String(p.numbers.contract);
    v.startDay = p.dates.start.day;
    v.startMonth = p.dates.start.month;
    v.endDay = p.dates.end.day;
    v.endMonth = p.dates.end.month;
    // п. 2.2 — общая сумма аренды из заявки
    v.price = String(p.rent.totalPrice || p.item.pricePerDay);
  }
  if (kind === 'RETURN_ACT') {
    v.docNumber = String(p.rent.id);
    v.periodStartDay = p.dates.start.day;
    v.periodStartMonth = p.dates.start.month;
    v.periodEndDay = p.dates.end.day;
    v.periodEndMonth = p.dates.end.month;
    v.periodStart = `${p.dates.start.day} ${p.dates.start.month}`;
    v.periodEnd = `${p.dates.end.day} ${p.dates.end.month}`;
    v.condition = 'ok';
  }
  if (kind === 'EXTENSION') {
    v.docNumber = `${p.numbers.contract}/${p.numbers.extension}`;
    v.oldEndDay = p.dates.end.day;
    v.oldEndMonth = p.dates.end.month;
    v.variant = 'same';
    // Пропись подставится автоматически при вводе суммы
    v.price = '';
  }
  if (kind === 'HANDOVER_ACT') {
    // Таблица 2 «Комплектность и стоимость» — состояние и цены пропечатаны по бланку
    const prices =
      p.itemType === 'bike'
        ? ['60 000,00', '40 000,00', '2 000,00', '2 000,00', '500,00', '500,00']
        : ['40 000,00', '2 000,00'];
    prices.forEach((price, i) => {
      v[`cond${i + 1}`] = 'Исправное';
      v[`price${i + 1}`] = price;
    });
    const total = prices.reduce((s, x) => s + (parseMoney(x) ?? 0), 0);
    v.totalSum = total.toLocaleString('ru-RU');
    v.totalWords = numToWordsRu(total);

    // Таблица 3 «Внешнее и техническое состояние» — столбец «Состояние» заполнен
    const stateCount = p.itemType === 'bike' ? 11 : 5;
    for (let i = 1; i <= stateCount; i++) {
      v[`state${i}`] = 'Рабочее/ без повреждений';
    }

    if (p.item.mileage !== null) v.mileage = String(p.item.mileage);
  }
  if (p.itemType === 'battery') {
    v.batterySpec = [p.item.voltage ? `${p.item.voltage} В` : '', p.item.capacityAh ? `${p.item.capacityAh} Ah` : '']
      .filter(Boolean)
      .join(' / ');
    v.itemName = p.item.name;
  }
  return v;
}

export default function NewDocumentPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-slate-950 text-slate-200 p-8">Загрузка…</div>}
    >
      <NewDocumentPageInner />
    </Suspense>
  );
}

function NewDocumentPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const docId = params?.get('docId');
  const kindParam = params?.get('kind') as DocKind | null;

  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [kind, setKind] = useState<DocKind | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        let rentId = params?.get('rentId');
        let batteryRentId = params?.get('batteryRentId');
        let k: DocKind | null = kindParam && VALID_KINDS.includes(kindParam) ? kindParam : null;
        let savedFields: Record<string, string> | null = null;
        let savedTitle = '';

        // Редактирование существующего документа
        if (docId) {
          const res = await fetch(`/api/admin/documents/${docId}`);
          const doc = await res.json();
          if (!res.ok) throw new Error(doc.error || 'Документ не найден');
          rentId = doc.rentId ? String(doc.rentId) : null;
          batteryRentId = doc.batteryRentId ? String(doc.batteryRentId) : null;
          k = doc.kind;
          savedFields = doc.fields as Record<string, string>;
          savedTitle = doc.title;
        }
        if (!k || (!rentId && !batteryRentId)) {
          setError('Некорректные параметры документа');
          return;
        }

        const q = rentId ? `rentId=${rentId}` : `batteryRentId=${batteryRentId}`;
        const res = await fetch(`/api/admin/documents/prefill?${q}`);
        const p: Prefill = await res.json();
        if (!res.ok) throw new Error((p as any).error || 'Ошибка данных аренды');

        setPrefill(p);
        setKind(k);
        const defaults = { ...buildDefaults(p, k), ...(savedFields ?? {}) };
        setValues(defaults);
        setTitle(
          savedTitle ||
            `${DOC_KIND_LABELS[k]} №${defaults.docNumber ?? p.rent.id} от ${defaults.docDay} ${defaults.docMonth}`
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      }
    })();
  }, [params, docId, kindParam]);

  // Поля, для которых сумма прописью генерируется из числового поля
  const WORDS_FROM: Record<string, string> = {
    price: 'priceWords',
    totalSum: 'totalWords',
  };

  const onChange = (name: string, value: string) =>
    setValues((v) => {
      const next = { ...v, [name]: value };

      // Числовое поле → пропись (договор-ДС: price→priceWords, акт: totalSum→totalWords)
      const wordsField = WORDS_FROM[name];
      if (wordsField) {
        const n = parseMoney(value);
        next[wordsField] = n === null ? '' : numToWordsRu(n);
      }

      // Комплектность в акте: price1..N → итого + пропись
      if (/^price\d+$/.test(name) && kind === 'HANDOVER_ACT') {
        const total = Object.keys(next)
          .filter((k) => /^price\d+$/.test(k))
          .reduce((s, k) => s + (parseMoney(next[k]) ?? 0), 0);
        next.totalSum = total ? total.toLocaleString('ru-RU') : '';
        next.totalWords = total ? numToWordsRu(total) : '';
      }

      return next;
    });

  const save = async () => {
    if (!docRef.current || !kind || !prefill) return;
    setBusy(true);
    setError(null);
    try {
      const html = serialize(docRef.current);
      const userFields = {
        userId: prefill.user.id,
        passport:
          values.passportSeries || values.passportNumber
            ? `${values.passportSeries} ${values.passportNumber}`.trim()
            : null,
        passportIssued: values.passportIssued || null,
        birthDate: values.birthDate || null,
        address: values.address || null,
      };
      const payload: any = {
        kind,
        title,
        html,
        fields: values,
        userFields,
      };
      if (docId) {
        const res = await fetch(`/api/admin/documents/${docId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const doc = await res.json();
        if (!res.ok) throw new Error(doc.error || 'Не удалось сохранить');
        router.push(`/admin/documents/${doc.id}`);
      } else {
        const rentId = params?.get('rentId');
        const batteryRentId = params?.get('batteryRentId');
        payload.rentId = rentId ? Number(rentId) : undefined;
        payload.batteryRentId = batteryRentId ? Number(batteryRentId) : undefined;
        const res = await fetch('/api/admin/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const doc = await res.json();
        if (!res.ok) throw new Error(doc.error || 'Не удалось сохранить');
        router.push(`/admin/documents/${doc.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
      setBusy(false);
    }
  };

  if (error && !prefill) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
        <p className="text-rose-400">{error}</p>
      </div>
    );
  }
  if (!prefill || !kind) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 p-8">Загрузка…</div>
    );
  }

  const Doc = DOC_COMPONENTS[kind];
  const backUrl = prefill.itemType === 'bike'
    ? `/admin/documents?rentId=${prefill.rent.id}`
    : `/admin/documents?batteryRentId=${prefill.rent.id}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <style>{DOC_CSS}</style>
      <div className="no-print sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3">
        <button
          onClick={() => router.push(backUrl)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm"
        >
          ← Документы
        </button>
        <span className="text-sm text-slate-400">
          {DOC_KIND_LABELS[kind]} · {prefill.user.name} · {prefill.item.name}
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-[240px] bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm"
          placeholder="Название документа"
        />
        <button
          onClick={() => docRef.current && printDocHtml(title, serialize(docRef.current))}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm"
        >
          Печать / PDF
        </button>
        <button
          onClick={save}
          disabled={busy}
          className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-medium disabled:opacity-50"
        >
          {busy ? 'Сохранение…' : docId ? 'Сохранить изменения' : 'Сохранить документ'}
        </button>
      </div>
      {error && <p className="no-print px-6 pt-3 text-sm text-rose-400">{error}</p>}
      <p className="no-print px-6 pt-3 text-xs text-slate-500">
        Подсвеченные поля — заполняемые графы бланка. При печати подложка и рамки не выводятся.
      </p>
      <div className="flex justify-center p-6">
        <div
          ref={docRef}
          className="bg-white text-black shadow-2xl"
          style={{ width: '210mm', minHeight: '297mm', padding: '15mm 15mm 15mm 20mm' }}
        >
          <Doc values={values} onChange={onChange} itemType={prefill.itemType} />
        </div>
      </div>
    </div>
  );
}
