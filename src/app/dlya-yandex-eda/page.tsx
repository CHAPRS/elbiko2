import type { Metadata } from "next";
import ServiceLanding from "@/components/ServiceLanding";

const service = {
  key: "yandex-eda",
  name: "Яндекс Еда",
  h1: "Аренда электровелосипеда для курьеров Яндекс Еда в Оренбурге",
  subtitle:
    "Электровелосипеды Wenbox U1 Pro и U6 PRO в аренду для курьеров Яндекс Еда в Оренбурге. Без залога, оформление за 5 минут, техобслуживание включено.",
  price: "от 457 ₽/сут",
  badge: "Для курьеров Яндекс Еда",
  description:
    "Аренда электровелосипедов Wenbox для курьеров Яндекс Еда в Оренбурге. От 457 ₽/сут, без залога, оформление за 5 минут. Звоните +7 (986) 775-30-30.",
  canonical: "/dlya-yandex-eda",
};

export const metadata: Metadata = {
  title: service.h1,
  description: service.description,
  keywords: [
    "аренда электровелосипеда Оренбург",
    "электровелосипед для курьера",
    "Яндекс Еда Оренбург",
    "курьер Яндекс Еда",
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

export default function YandexEdaPage() {
  return <ServiceLanding service={service} />;
}
