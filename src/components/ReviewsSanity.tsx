import React from 'react'
import { urlFor } from '@/lib/sanity'
import Image from 'next/image'

interface ReviewData {
  author: string
  avatar?: any
  platform?: string
  duration?: string
  rating: number
  text: string
  order?: number
}

interface ReviewsSanityProps {
  reviews: ReviewData[]
}

export default function ReviewsSanity({ reviews }: ReviewsSanityProps) {
  if (!reviews || reviews.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
          Отзывы курьеров
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Что говорят те, кто уже работает с ELBIKO
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review.order || review.author}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300"
          >
            <div className="flex items-start gap-4 mb-4">
              {review.avatar ? (
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-slate-800">
                  <Image
                    src={urlFor(review.avatar).url()}
                    alt={review.author}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {review.author.charAt(0)}
                  </span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white mb-1">{review.author}</div>
                {review.platform && (
                  <div className="text-xs text-slate-400">{review.platform}</div>
                )}
              </div>

              <div className="flex gap-1 flex-shrink-0">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < review.rating ? 'text-yellow-400' : 'text-slate-600'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">{review.text}</p>

            {review.duration && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-500">
                  Использует {review.duration}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
