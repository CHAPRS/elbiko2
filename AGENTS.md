# Elbiko — проектная память для Devin

## Что это

- **Сайт**: аренда электровелосипедов для курьеров в Оренбурге.
- **Продакшен**: `https://elbiko.ru`
- **GitHub**: `https://github.com/CHAPRS/elbiko2`, ветка `master`
- **Локальный репозиторий**: `C:\xampp\htdocs\ebike-rent` (Windows, XAMPP)
- **Продакшен сервер**: Ubuntu VPS `root@172993`, путь `/var/www/elbiko`
- **Балансер**: Nginx 1.18.0 проксирует на `http://127.0.0.1:3000`
- **Сервис**: `systemd` → `elbiko.service`
- **БД**: MySQL (локально в XAMPP, на сервере — `mysql` systemd)

## Стек

- Next.js 14.2.35 + App Router
- TypeScript
- Tailwind CSS
- Prisma 6.19.3
- MySQL
- nodemailer
- Zustand, Next-sanity, react-hook-form

## Важные команды

### Локально

```powershell
cd "C:\xampp\htdocs\ebike-rent"
npm run typecheck      # tsc --noEmit
npm run dev            # порт 3000, если занят — 3001
npx prisma db push     # при изменении схемы
npx prisma generate    # обновить Prisma Client
npx prisma studio      # GUI БД
npm run build          # обычный (не standalone) билд
```

### Продакшен

```bash
cd /var/www/elbiko
git pull origin master
npx prisma generate
rm -rf .next
NODE_OPTIONS=--max-old-space-size=1536 npx next build
systemctl daemon-reload
systemctl restart elbiko
```

### Диагностика

```bash
systemctl is-active elbiko
systemctl status elbiko -n 20
journalctl -u elbiko -n 50
ss -tlnp | grep 3000

curl -I http://127.0.0.1:3000
curl -I http://127.0.0.1:3000/admin
curl -s http://127.0.0.1:3000/api/bikes
curl -I http://127.0.0.1:3000/_next/static/css/<hash>.css
curl -I http://127.0.0.1:3000/images/wenbox-u1-pro.webp
```

## Архитектура

- **Главная страница** `/` — `use client`, подгружает велосипеды клиентом через `fetch('/api/bikes')`.
- **Каталог** рендерится в `src/components/CompactCatalog.tsx`, карточка — `src/app/(landing)/BikeCard.tsx`.
- **Админка** — `/admin/*`, отдельная сессия.
- **Курьерский ЛК** — `/register`, `/verify-email`, `/login`, `/profile`, `/dashboard`.
- **API-роуты** — `src/app/api/**`.
- **Аутентификация курьера** — email + phone, `courier_session` cookie.
- **Регистрация по email** — `POST /api/auth/courier/register`, подтверждение через `GET /api/auth/courier/verify`.
- **Изображения** — лежат в `public/images/`. Нормализация в `src/lib/image.ts`.

## Ключевые файлы

- `prisma/schema.prisma`
- `prisma/update-bikes.ts` — апсерт целевых велосипедов (U1 Pro, U6 PRO)
- `src/lib/mail.ts` — отправка почты
- `src/lib/image.ts` — нормализация URL и fallback-картинки
- `src/components/CompactCatalog.tsx`
- `src/app/(landing)/BikeCard.tsx`
- `src/app/api/auth/courier/register/route.ts`
- `src/app/api/bikes/route.ts`
- `next.config.mjs`

## Конфигурация продакшен-сервиса

Файл `/etc/systemd/system/elbiko.service`:

```ini
[Unit]
Description=Elbiko Next.js
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/elbiko
Environment="PORT=3000"
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node /var/www/elbiko/node_modules/next/dist/bin/next start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Важно**: `next.config.mjs` больше не использует `output: 'standalone'` — обычный `next start` корректно раздаёт `/_next/static`, `public/images` и API.

## Почта / SMTP

- Яндекс SMTP (`smtp.yandex.ru`) не работает на сервере: в локации Новосибирск провайдер закрыл исходящие почтовые порты 465, 587, 25 без возможности открытия.
- Регистрация работает: при ошибке SMTP курьер сохраняется, а ссылка подтверждения пишется в `journalctl -u elbiko`.
- Для реальной отправки письмов остаётся:
  1. Переезд VPS в другую локацию.
  2. HTTP API сервиса (SendPulse, Unisender и др.) — нужен API key.

## Предпочтения пользователя

- Всегда тестировать локально (`npm run typecheck`) перед продакшеном.
- Деплой консервативный: VPS сильно ограничен по RAM/swap.
- Сохранять работу публичного сайта и админки.
- Пушить в `origin/master`.
- Не коммитить `.env` и секреты.
- Общение на русском.

## Текущее состояние

- Сайт и админка работают.
- В каталоге отображаются две карточки: WENBOX U1 Pro и WENBOX U6 PRO, со своими фото.
- Регистрация курьера выполняется, ссылка подтверждения — в логах сервиса.
- Сборка проходит успешно с `NODE_OPTIONS=--max-old-space-size=1536`.

## Подводных камней

- `public/images/` содержит файлы с пробелами и кириллицей. `normalizeImageUrl` не должен заменять пробелы на дефисы.
- При пересборке нужно `rm -rf .next`, иначе `next start` может подхватить старые/standalone-файлы.
- Каталог велосипедов управляется `prisma/update-bikes.ts` — при изменении моделей/цен/фото стоит перезапускать его на сервере.
