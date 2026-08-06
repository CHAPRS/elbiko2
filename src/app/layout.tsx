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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Принудительная разблокировка скролла при загрузке страницы
              (function() {
                if (typeof document !== 'undefined') {
                  // Сброс всех блокировок при загрузке
                  document.addEventListener('DOMContentLoaded', () => {
                    document.body.style.overflow = 'auto';
                    document.body.style.pointerEvents = 'auto';
                    document.documentElement.style.overflow = 'auto';
                    document.documentElement.style.pointerEvents = 'auto';
                  });

                  // Также сбрасываем через небольшой таймаут
                  setTimeout(() => {
                    document.body.style.overflow = 'auto';
                    document.body.style.pointerEvents = 'auto';
                    document.documentElement.style.overflow = 'auto';
                    document.documentElement.style.pointerEvents = 'auto';
                  }, 100);

                  // И еще раз через 500мс
                  setTimeout(() => {
                    document.body.style.overflow = 'auto';
                    document.body.style.pointerEvents = 'auto';
                    document.documentElement.style.overflow = 'auto';
                    document.documentElement.style.pointerEvents = 'auto';
                  }, 500);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="overflow-auto pointer-events-auto">{children}</body>
    </html>
  );
}
