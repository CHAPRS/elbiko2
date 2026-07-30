import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Аренда Электровелосипедов для Курьеров",
  description: "Быстрый заработок в доставке",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
