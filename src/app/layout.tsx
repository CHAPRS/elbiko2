import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { CONTACTS } from "@/app/constants";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ЭльБайко — аренда электровелосипедов для курьеров в Оренбурге",
  description:
    `Аренда электровелосипедов для курьеров в ${CONTACTS.city} от 450 ₽/сутки. Свободные модели, быстрое оформление, без залога. Звоните ${CONTACTS.phoneDisplay}.`,
  keywords: [
    "аренда электровелосипеда Оренбург",
    "электровелосипед для курьера",
    "аренда байка курьеру",
    "ЭльБайко",
    "электровелосипед Оренбург",
    "доставка Яндекс Еда",
    "Самокат",
  ],
  openGraph: {
    title: "ЭльБайко — аренда электровелосипедов для курьеров в Оренбурге",
    description:
      "Аренда электровелосипедов для курьеров от 450 ₽/сутки. Быстрое оформление, без залога.",
    url: "https://elbiko.ru",
    siteName: "ЭльБайко",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ЭльБайко — аренда электровелосипедов для курьеров в Оренбурге",
    description:
      "Аренда электровелосипедов для курьеров от 450 ₽/сутки. Быстрое оформление, без залога.",
  },
  alternates: {
    canonical: "https://elbiko.ru",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "ЭльБайко",
  description: `Аренда электровелосипедов для курьеров в ${CONTACTS.city}`,
  url: "https://elbiko.ru",
  telephone: CONTACTS.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACTS.address,
    addressLocality: CONTACTS.city,
    addressCountry: "RU",
  },
  openingHours: ["Mo-Su 09:00-21:00"],
  areaServed: CONTACTS.city,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
      </head>
      <body className="overflow-auto pointer-events-auto">{children}</body>
    </html>
  );
}
