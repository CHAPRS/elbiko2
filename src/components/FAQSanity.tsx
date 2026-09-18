'use client'
import React, { useState } from 'react'

interface FAQData {
  question: string
  answer: string
  order?: number
}

interface FAQSanityProps {
  faqs: FAQData[]
}

export default function FAQSanity({ faqs }: FAQSanityProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!faqs || faqs.length === 0) return null

  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 py-20 space-y-8 scroll-mt-24">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Часто задаваемые вопросы
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx
          
          return (
            <div
              key={faq.order || faq.question}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left font-bold text-sm text-white flex justify-between items-center group focus:outline-none"
              >
                <span>{faq.question}</span>
                <span className="text-emerald-400 group-hover:scale-110 transition-transform">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
