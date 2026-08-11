import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

// ... интерфейсы ...

async function getPageData() {
  const query = `{
    "hero": *[_type == "hero"][0]{ title, subtitle, ctaText },
    "tariffs": *[_type == "tariff"]{ _id, title, pricePerDay, batteryRange, maxSpeed, features, status, image },
    "reviews": *[_type == "review"]{ _id, courierName, deliveryService, rating, text },
    "faqs": *[_type == "faq"] | order(order asc){ _id, question, answer }
  }`

  try {
    const data = await client.fetch(query, {}, { next: { revalidate: 10 } })
    return {
      hero: data?.hero || { title: "Надежные электровелосипеды" },
      tariffs: Array.isArray(data?.tariffs) ? data.tariffs : [],
      reviews: Array.isArray(data?.reviews) ? data.reviews : [],
      faqs: Array.isArray(data?.faqs) ? data.faqs : []
    }
  } catch (error) {
    console.error("❌ Ошибка получения данных:", error)
    return { hero: null, tariffs: [], reviews: [], faqs: [] }
  }
}

export default async function HomePage() {
  const { hero, tariffs, reviews, faqs } = await getPageData()

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      {/* ... Навигация ... */}
      {/* ... Hero секция ... */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-32">
        {/* ... Тарифы (исправлен цикл .map) ... */}
        {/* ... Отзывы ... */}
        {/* ... FAQ ... */}
      </div>
    </main>
  )
}

