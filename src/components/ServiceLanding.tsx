'use client';
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ServiceHero from '@/components/ServiceHero';
import ServiceNav from '@/components/ServiceNav';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import CompactCatalog from '@/components/CompactCatalog';
import Tariffs from '@/components/Tariffs';
import Reviews from '@/components/Reviews';
import Business from '@/components/Business';
import FAQSection from '@/components/FAQSection';
import { BookingModal } from '@/components/BookingModal';
import { useRentStore } from '@/store/useRentStore';

interface ServiceConfig {
  key: string;
  name: string;
  h1: string;
  subtitle: string;
  price: string;
  badge: string;
}

interface ServiceLandingProps {
  service: ServiceConfig;
}

export default function ServiceLanding({ service }: ServiceLandingProps) {
  const [bikes, setBikes] = useState<any[]>([]);
  const { selectBike, toggleBookingModal } = useRentStore();

  useEffect(() => {
    fetch('/api/bikes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBikes(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleBook = (bike: any) => {
    selectBike(bike);
    toggleBookingModal(true);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-slate-950">
      <Header />
      <ServiceNav />
      <ServiceHero
        badge={service.badge}
        h1={service.h1}
        subtitle={service.subtitle}
        price={service.price}
      />
      <section id="how-it-works" className="scroll-mt-24">
        <HowItWorks />
      </section>
      <Features />
      <CompactCatalog bikes={bikes} onBook={handleBook} />
      <Tariffs />
      <Reviews />
      <Business />
      <FAQSection />
      <BookingModal />
    </div>
  );
}
