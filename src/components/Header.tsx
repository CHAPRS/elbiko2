'use client';
import React, { useState, useEffect } from 'react';
import { CONTACTS, SHOW_REPAIR_SECTION } from '@/app/constants';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);

  // Блокируем скролл при открытом мобильном меню
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '#tariffs', label: 'Тарифы' },
    { href: '#how-it-works', label: 'Как арендовать' },
    { href: '#catalog', label: 'Каталог' },
    { href: '#advantages', label: 'Преимущества' },
    { href: '#business', label: 'Бизнесу' },
    ...(SHOW_REPAIR_SECTION ? [{ href: '#repair', label: 'Ремонт' }] : []),
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
              className="hover:text-emerald-400 transition-colors py-3 min-h-11 flex items-center"
            >
              {link.label}
            </a>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
            <a 
              href="/login" 
              className="hidden sm:flex items-center justify-center min-h-11 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
            >
              Личный кабинет
            </a>
          
          {/* Contact button with dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setContactMenuOpen(!contactMenuOpen)}
              className="text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-500/50 px-4 min-h-11 rounded-xl transition-all flex items-center gap-2"
            >
              Связаться
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {contactMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50">
                <div className="py-2">
                  <a
                    href={CONTACTS.telegramBot}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                    </svg>
                    Заказать звонок
                  </a>
                  <a
                    href={`tel:${CONTACTS.phone}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Позвонить
                  </a>
                  <a
                    href={CONTACTS.telegramManager}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                    </svg>
                    Telegram
                  </a>
                  {CONTACTS.maxUrl ? (
                    <a
                      href={CONTACTS.maxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
                    >
                      <span className="w-5 h-5 flex items-center justify-center text-xs bg-purple-500/30 text-purple-300 rounded">MAX</span>
                      Написать в MAX
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400">
                      <span className="w-4 h-4 flex items-center justify-center text-xs">MAX</span>
                      {CONTACTS.maxPhoneDisplay}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 min-w-11 min-h-11 flex items-center justify-center text-slate-400 hover:text-white"
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
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
                className="block text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors min-h-11 py-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              className="block text-center px-4 py-3 min-h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-sm font-bold transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Личный кабинет
            </a>
            
            {/* Mobile contact buttons */}
            <div className="pt-4 border-t border-slate-900 space-y-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Связаться</div>
              <a
                href={CONTACTS.telegramBot}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold rounded-xl transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                Заказать звонок
              </a>
              <a
                href={`tel:${CONTACTS.phone}`}
                className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Позвонить
              </a>
              <a
                href={CONTACTS.telegramManager}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold rounded-xl transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                Telegram
              </a>
              {CONTACTS.maxUrl ? (
                <a
                  href={CONTACTS.maxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 font-semibold rounded-xl transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-5 h-5 flex items-center justify-center text-xs bg-purple-500/30 rounded">MAX</span>
                  MAX
                </a>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700 text-slate-400 font-semibold rounded-xl">
                  <span className="w-5 h-5 flex items-center justify-center text-xs bg-slate-700 rounded">MAX</span>
                  {CONTACTS.maxPhoneDisplay}
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}