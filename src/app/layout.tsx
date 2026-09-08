import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { CONTACTS, FAQ_ITEMS } from "@/app/constants";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elbiko.ru";
const description = `Аренда электровелосипедов Wenbox для курьеров в ${CONTACTS.city}. От 457 ₽/сутки, без залога, оформление за 5 минут. Звоните ${CONTACTS.phoneDisplay}.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ЭльБайко — аренда электровелосипедов для курьеров в Оренбурге",
  description,
  keywords: [
    "аренда электровелосипеда Оренбург",
    "электровелосипед для курьера",
    "аренда байка курьеру",
    "ЭльБайко",
    "электровелосипед Оренбург",
    "доставка Яндекс Еда",
    "Самокат",
    "Wenbox U1 Pro",
    "Wenbox U6 PRO",
  ],
  openGraph: {
    title: "ЭльБайко — аренда электровелосипедов для курьеров в Оренбурге",
    description,
    url: "/",
    siteName: "ЭльБайко",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: `${siteUrl}/images/hero-bike-main.webp`,
        alt: "ЭльБайко — аренда электровелосипедов для курьеров в Оренбурге",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ЭльБайко — аренда электровелосипедов для курьеров в Оренбурге",
    description,
    images: [`${siteUrl}/images/hero-bike-main.webp`],
  },
  alternates: {
    canonical: "/",
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
  url: siteUrl,
  telephone: CONTACTS.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACTS.address,
    addressLocality: CONTACTS.city,
    addressCountry: "RU",
  },
  openingHours: ["Mo-Fr 10:00-18:00"],
  areaServed: CONTACTS.city,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
        />
      </head>
      <body className="overflow-auto pointer-events-auto">{children}</body>
    </html>
  );
}
