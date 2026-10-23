'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DOC_CSS } from '@/lib/docCss';
import { printDocHtml } from '@/lib/docPrint';

interface Doc {
  id: number;
  kind: string;
  title: string;
  html: string;
  createdAt: string;
  rentId: number | null;
  batteryRentId: number | null;
}

// Собирает полный standalone-HTML для скачивания/отправки клиенту
function toStandaloneFile(title: string, html: string): string {
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>${title}</title><style>${DOC_CSS}body{background:#fff;margin:0;padding:20mm;}</style></head><body>${html}</body></html>`;
}

export default function DocumentViewPage() {
  const params = useParams<{ id: string }>() ?? { id: '' };
  const router = useRouter();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/documents/${params.id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Документ не найден');
        return;
      }
      setDoc(data);
    })();
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
        <p className="text-rose-400">{error}</p>
      </div>
    );
  }
  if (!doc) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 p-8">Загрузка…</div>;
  }

  const backUrl = doc.rentId
    ? `/admin/documents?rentId=${doc.rentId}`
    : `/admin/documents?batteryRentId=${doc.batteryRentId}`;

  const download = () => {
    const blob = new Blob([toStandaloneFile(doc.title, doc.html)], {
      type: 'text/html;charset=utf-8',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${doc.title.replace(/[\\/:*?"<>|]/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

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
        <span className="text-sm font-medium">{doc.title}</span>
        <span className="text-xs text-slate-500">
          {new Date(doc.createdAt).toLocaleString('ru-RU')}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => router.push(`/admin/documents/new?docId=${doc.id}`)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm"
          >
            Редактировать
          </button>
          <button
            onClick={download}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm"
          >
            Скачать
          </button>
          <button
            onClick={() => printDocHtml(doc.title, doc.html)}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-medium"
          >
            Печать / PDF
          </button>
        </div>
      </div>
      <div className="flex justify-center p-6 no-print">
        <div
          className="bg-white text-black shadow-2xl"
          style={{ width: '210mm', minHeight: '297mm', padding: '15mm 15mm 15mm 20mm' }}
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />
      </div>
    </div>
  );
}
