'use client';
import React, { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#tariffs', label: 'Тарифы' },
    { href: '#how-it-works', label: 'Как взять в аренду' },
    { href: '#catalog', label: 'Каталог' },
    { href: '#advantages', label: 'Преимущества' },
    { href: '#business', label: 'Бизнесу' },
    { href: '#repair', label: 'Ремонт' },
  ];

  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white tracking-tighter font-mono">ЭльБайко</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase tracking-widest font-black border border-emerald-500/30">
            Оренбург
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          {navLinks.map((link) => (
            <a 
              key={link.href}
              href={link.href}
              className="hover:text-emerald-400 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
            <a 
              href="/login" 
              className="hidden sm:block px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
            >
              Личный кабинет
            </a>
          <a 
            href="/admin" 
            className="text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-500/50 px-4 py-2 rounded-xl transition-all"
          >
            Диспетчерская
          </a>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-900 bg-slate-950/95 backdrop-blur-md">
          <nav className="px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              className="block text-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-sm font-bold transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Личный кабинет
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}