import type { Metadata } from "next";
import ServiceLanding from "@/components/ServiceLanding";

const service = {
  key: "kuper",
  name: "Купер",
  h1: "Аренда электровелосипеда для курьеров Купер в Оренбурге",
  subtitle:
    "Готовые к работе электровелосипеды Wenbox в аренду для курьеров службы доставки Купер в Оренбурге. Без залога, ёмкие аккумуляторы, сервис включён.",
  price: "от 457 ₽/сут",
  badge: "Для курьеров Купер",
  description:
    "Аренда электровелосипедов для курьеров Купер в Оренбурге. Wenbox U1 Pro и U6 PRO от 457 ₽/сут, без залога. Звоните +7 (986) 775-30-30.",
  canonical: "/dlya-kuper",
};

export const metadata: Metadata = {
  title: service.h1,
  description: service.description,
  keywords: [
    "аренда электровелосипеда Оренбург",
    "электровелосипед для курьера",
    "Купер Оренбург",
    "курьер Купер",
    "Wenbox U1 Pro",
    "Wenbox U6 PRO",
  ],
  openGraph: {
    title: service.h1,
    description: service.description,
    images: [
      {
        url: "/images/hero-bike-main.webp",
        alt: "ЭльБайко — аренда электровелосипедов",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: service.h1,
    description: service.description,
    images: ["/images/hero-bike-main.webp"],
  },
  alternates: { canonical: service.canonical },
};

export default function KuperPage() {
  return <ServiceLanding service={service} />;
}
