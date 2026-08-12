import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Tariffs from '@/components/Tariffs'
import Reviews from '@/components/Reviews'
import HowItWorks from '@/components/HowItWorks'
import Business from '@/components/Business'
import Repair from '@/components/Repair'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Tariffs />
      <Reviews />
      <Business />
      <Repair />
    </main>
  )
}

