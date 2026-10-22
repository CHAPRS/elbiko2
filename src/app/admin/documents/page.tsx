'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DOC_KIND_LABELS, DocKind } from '@/components/admin/documents/DocTemplates';

interface DocRow {
  id: number;
  kind: string;
  title: string;
  createdAt: string;
}

interface Prefill {
  itemType: 'bike' | 'battery';
  rent: { id: number; status: string; startDate: string; endDate: string; totalPrice: number };
  user: { id: number; name: string; phone: string };
  item: { name: string; externalId: string | null };
}

const KINDS: DocKind[] = ['CONTRACT', 'HANDOVER_ACT', 'RETURN_ACT', 'EXTENSION'];

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'активна',
  OVERDUE: 'просрочена',
  RETURNED: 'возвращена',
  COMPLETED: 'завершена',
  CANCELLED: 'отменена',
};

export default function DocumentsPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-slate-950 text-slate-200 p-8">Загрузка…</div>}
    >
      <DocumentsPageInner />
    </Suspense>
  );
}

function DocumentsPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const rentId = params?.get('rentId');
  const batteryRentId = params?.get('batteryRentId');
  const q = rentId ? `rentId=${rentId}` : `batteryRentId=${batteryRentId}`;

  const [docs, setDocs] = useState<DocRow[]>([]);
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [docsRes, prefillRes] = await Promise.all([
        fetch(`/api/admin/documents?${q}`),
        fetch(`/api/admin/documents/prefill?${q}`),
      ]);
      const d = await docsRes.json();
      const p = await prefillRes.json();
      if (!docsRes.ok) throw new Error(d.error || 'Ошибка списка');
      if (!prefillRes.ok) throw new Error(p.error || 'Аренда не найдена');
      setDocs(d);
      setPrefill(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rentId && !batteryRentId) {
      setError('Не указана аренда');
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentId, batteryRentId]);

  const removeDoc = async (id: number) => {
    if (!confirm('Удалить документ?')) return;
    await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' });
    load();
  };

  const newDoc = (kind: DocKind) => {
    router.push(`/admin/documents/new?${q}&kind=${kind}`);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 p-8">Загрузка…</div>;
  }
  if (error || !prefill) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
        <p className="text-rose-400">{error ?? 'Нет данных'}</p>
      </div>
    );
  }

  const r = prefill.rent;
  const backUrl = rentId ? '/admin/rents' : '/admin/dispatch';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push(backUrl)}
          className="mb-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm"
        >
          ← Назад
        </button>

        <h1 className="text-xl font-semibold mb-1">Документы по аренде #{r.id}</h1>
        <p className="text-sm text-slate-400 mb-6">
          {prefill.user.name} · {prefill.user.phone} · {prefill.item.name}
          {prefill.item.externalId ? ` (${prefill.item.externalId})` : ''} ·{' '}
          {STATUS_LABELS[r.status] ?? r.status} ·{' '}
          {new Date(r.startDate).toLocaleDateString('ru-RU')} —{' '}
          {new Date(r.endDate).toLocaleDateString('ru-RU')}
        </p>

        <h2 className="text-sm font-medium text-slate-300 mb-2">Создать документ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
          {KINDS.map((kind) => (
            <button
              key={kind}
              onClick={() => newDoc(kind)}
              className="px-4 py-3 bg-slate-900 border border-slate-800 hover:border-cyan-600 rounded-lg text-left text-sm transition-colors"
            >
              + {DOC_KIND_LABELS[kind]}
            </button>
          ))}
        </div>

        <h2 className="text-sm font-medium text-slate-300 mb-2">Сохранённые документы</h2>
        {docs.length === 0 ? (
          <p className="text-sm text-slate-500">Документов пока нет.</p>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => router.push(`/admin/documents/${d.id}`)}
                    className="text-sm text-cyan-400 hover:text-cyan-300 truncate block text-left"
                  >
                    {d.title}
                  </button>
                  <span className="text-xs text-slate-500">
                    {DOC_KIND_LABELS[d.kind as DocKind] ?? d.kind} ·{' '}
                    {new Date(d.createdAt).toLocaleString('ru-RU')}
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/admin/documents/${d.id}`)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs"
                >
                  Открыть
                </button>
                <button
                  onClick={() => removeDoc(d.id)}
                  className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 rounded text-xs"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
