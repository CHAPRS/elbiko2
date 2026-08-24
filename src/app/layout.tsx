import type { Metadata, Viewport } from "next";
import "@/app/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ЭльБайко — аренда электровелосипедов для курьеров в Оренбурге",
  description:
    "Аренда электровелосипедов для курьеров в Оренбурге от 450 ₽/сутки. Свободные модели, быстрое оформление, без залога. Звоните +7 (986) 775-30-30.",
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
  description: "Аренда электровелосипедов для курьеров в Оренбурге",
  url: "https://elbiko.ru",
  telephone: "+79867753030",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Салмышская улица, 44",
    addressLocality: "Оренбург",
    addressCountry: "RU",
  },
  openingHours: ["Mo-Su 09:00-21:00"],
  areaServed: "Оренбург",
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
