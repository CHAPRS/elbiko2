'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const NAV = [
  { href: '/admin/dispatch', label: 'Диспетчерская' },
  { href: '/admin', label: 'Автопарк' },
  { href: '/admin/leads', label: 'Заявки' },
  { href: '/admin/rents', label: 'Аренды' },
];

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href !== '/admin' && pathname.startsWith(href)) return true;
  return false;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/80 p-4 flex flex-col shrink-0">
        <div className="mb-8 px-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Elbiko
          </h2>
          <p className="text-xs text-slate-400 mt-1">Панель управления</p>
        </div>

        <nav className="space-y-1">
          {NAV.map((item) => {
            const active = isActive(pathname ?? '', item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2 text-xs text-slate-500">
          <p>Роль: владелец</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
