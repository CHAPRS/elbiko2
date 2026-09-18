import type { Metadata } from "next";
import ServiceLanding from "@/components/ServiceLanding";

const service = {
  key: "pyaterochka",
  name: "Пятерочка",
  h1: "Аренда электровелосипеда для курьеров Пятерочка в Оренбурге",
  subtitle:
    "Надёжные электровелосипеды Wenbox в аренду для курьеров службы доставки Пятерочка в Оренбурге. Без залога, техобслуживание, помощь 7 дней в неделю.",
  price: "от 457 ₽/сут",
  badge: "Для курьеров Пятерочка",
  description:
    "Аренда электровелосипедов для курьеров Пятерочка в Оренбурге. Wenbox U1 Pro и U6 PRO от 457 ₽/сут, без залога. Звоните +7 (986) 775-30-30.",
  canonical: "/dlya-pyaterochka",
};

export const metadata: Metadata = {
  title: service.h1,
  description: service.description,
  keywords: [
    "аренда электровелосипеда Оренбург",
    "электровелосипед для курьера",
    "Пятерочка Оренбург",
    "курьер Пятерочка",
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

export default function PyaterochkaPage() {
  return <ServiceLanding service={service} />;
}
