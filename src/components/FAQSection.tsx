'use client';
import React, { useState } from 'react';
import { FAQ_ITEMS } from '@/app/constants';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 py-20 space-y-8 scroll-mt-24">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white">Часто задаваемые вопросы</h2>
      </div>
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, index) => (
          <div
            key={index}
            className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50 hover:border-slate-700 transition-colors"
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full text-left p-5 flex justify-between items-center text-slate-100 font-semibold focus:outline-none"
            >
              {item.q}
              <span className="text-emerald-400 text-xl font-bold ml-4">
                {openIndex === index ? '−' : '+'}
              </span>
            </button>
            {openIndex === index && (
              <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
