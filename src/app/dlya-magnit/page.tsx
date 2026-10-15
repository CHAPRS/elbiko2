import type { Metadata } from "next";
import ServiceLanding from "@/components/ServiceLanding";

const service = {
  key: "magnit",
  name: "Магнит",
  h1: "Электровелосипед для курьеров Магнит в Оренбурге",
  subtitle:
    "Аренда электровелосипедов Wenbox U1 Pro и U6 PRO для курьеров Магнит в Оренбурге. Долгий запас хода, быстрая выдача, без залога.",
  price: "от 457 ₽/сут",
  badge: "Для курьеров Магнит",
  description:
    "Электровелосипед для курьеров Магнит в Оренбурге. Аренда Wenbox от 457 ₽/сут, без залога, оформление за 5 минут. Звоните +7 (986) 775-30-30.",
  canonical: "/dlya-magnit",
};

export const metadata: Metadata = {
  title: service.h1,
  description: service.description,
  keywords: [
    "аренда электровелосипеда Оренбург",
    "электровелосипед для курьера",
    "Магнит Оренбург",
    "курьер Магнит",
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

export default function MagnitPage() {
  return <ServiceLanding service={service} />;
}
