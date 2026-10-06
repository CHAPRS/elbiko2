import type { Metadata } from "next";
import ServiceLanding from "@/components/ServiceLanding";

const service = {
  key: "samokat",
  name: "Самокат",
  h1: "Электровелосипед для курьеров Самокат в Оренбурге",
  subtitle:
    "Аренда электровелосипедов Wenbox для работы курьером в службе доставки Самокат в Оренбурге. Без залога, быстрое оформление, помощь с ремонтом.",
  price: "от 457 ₽/сут",
  badge: "Для курьеров Самокат",
  description:
    "Электровелосипед для курьеров Самокат в Оренбурге. Аренда Wenbox U1 Pro и U6 PRO от 457 ₽/сут, без залога. Звоните +7 (986) 775-30-30.",
  canonical: "/dlya-samokat",
};

export const metadata: Metadata = {
  title: service.h1,
  description: service.description,
  keywords: [
    "аренда электровелосипеда Оренбург",
    "электровелосипед для курьера",
    "Самокат Оренбург",
    "курьер Самокат",
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

export default function SamokatPage() {
  return <ServiceLanding service={service} />;
}
