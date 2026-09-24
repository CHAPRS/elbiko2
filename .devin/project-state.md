# Elbiko — срез проекта для продолжения работы

## 1. Общее

- **Назначение:** сайт и ERP для аренды электровелосипедов курьерам в Оренбурге.
- **Репозиторий:** `https://github.com/CHAPRS/elbiko2`, ветка `master`.
- **Локально:** `C:\xampp\htdocs\ebike-rent` (Windows, XAMPP, MySQL).
- **Продакшен:** Ubuntu VPS `root@172993`, `/var/www/elbiko`, systemd-сервис `elbiko.service`.
- **Публичный сайт:** `https://elbiko.ru`.
- **Nginx** проксирует на `http://127.0.0.1:3000`.
- **Next.js** обычный (не standalone): `next start` раздаёт страницы, API и static.

## 2. Стек

- Next.js `14.2.0`, React `18`, TypeScript `5.9.3`, Tailwind CSS `3.4.1`.
- Prisma `6.19.3`, MySQL.
- Zod `^4.4.3`, Zustand `^4.5.1`, react-hook-form `^7.50.1`.
- next-sanity, nodemailer, sharp, styled-components.
- `tsx` для Prisma-скриптов (`prisma/*.ts`).

## 3. Инфраструктура и конфигурация

### Важные файлы

- `next.config.mjs` — отключён `poweredByHeader`, настроены image форматы и remotePatterns (`cdn.sanity.io`), security headers (HSTS, X-Frame, X-Content-Type, Permissions-Policy).
- `tailwind.config.ts` — стандартная конфигурация, контент `src/{pages,components,app}`.
- `src/middleware.ts` — CORS, защита `/api/admin`, `/admin`, `/dashboard`, редиректы для `/login`.

### Middleware

- CORS для `/api`.
- `/api/admin` требует `admin_session`.
- `/admin` требует `admin_session`.
- `/dashboard` требует `courier_session`.
- `/login` редиректит уже авторизованных: курьера → `/dashboard`, админа → `/admin`.

### Сессии

- **Админ:** `admin_session` = HMAC-SHA256 токен, секрет `ADMIN_PASSWORD`, payload `{type:'admin', role:'OWNER'}` (см. `src/lib/session.ts`).
- **Курьер:** `courier_session` = строковый `userId`.
- Обе куки `httpOnly`, `secure` в продакшене, `sameSite` (`lax` для админа, `strict` для курьера).

## 4. База данных

### Ключевые модели (`prisma/schema.prisma`)

- `Bike` — `id`, `name`, `speed`, `range`, `motor`, `battery`, `isWaterproof`, `status`, `pricePerDay`, `externalId`, `imageUrl`.
  - Статусы: `FREE`, `RENTED`, `MAINTENANCE`, `BLOCKED`.
- `User` — `id`, `phone` (unique), `password`, `name`, `balance`, `telegramChatId`, `maxChatId`, `preferredMessenger`, `email`, `emailVerified`, `emailVerificationToken`.
- `Rent` — `id`, `userId`, `bikeId`, `startDate`, `endDate`, `actualReturnDate`, `totalPrice`, `isActive`, `status`.
  - Статусы: `ACTIVE`, `RETURNED`, `COMPLETED`, `CANCELLED`, `OVERDUE`.
- `Payment` — `rentId` (unique), `amount`, `status` (`PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`), `paymentMethod`, `paidAt`.
- `RentTransaction` — `rentId`, `type` (`PAYMENT`, `EXTEND`, `REFUND`, `PENALTY`, `DEPOSIT`), `amount`, `method`, `comment`.
- `Lead` — `id`, `name`, `phone`, `bikeName`, `status` (`NEW`, `IN_PROGRESS`, `CONFIRMED`, `REJECTED`), `message`, `comment`, `rejectReason`, `rentDays`, `totalPrice`, `startDate`, `endDate`, `bikeId`.
- `Contact` — `id`, `firstName`, `lastName`, `phone` (unique-ish), `email`, `status`, `source`, `notes`, `lastContactAt`.
- `RentalSession` — устаревающая модель сессий, пока дублирует логику.
- CMS-модели: `Hero`, `Feature`, `Step`, `Tariff`, `Review`, `FAQ`.

## 5. Админка

### Layout

- `src/app/admin/layout.tsx` → `AdminShell`.
- `src/components/admin/AdminShell.tsx` — фиксированный сайдбар `w-64` с навигацией:
  - `/admin/dispatch` — Диспетчерская
  - `/admin` — Автопарк
  - `/admin/bike-stats` — Статистика
  - `/admin/leads` — Заявки
  - `/admin/rents` — Аренды
  - `/admin/contacts` — Контакты
- **Проблема мобильной версии:** сайдбар не адаптивен, страницы используют таблицы и мелкие кнопки.

### Страницы админки

- `/admin` — управление автопарком, форма добавления/редактирования байка, таблица байков.
- `/admin/dispatch` — дашборд диспетчера.
- `/admin/leads` — список заявок, смена статуса, конвертация в аренду.
- `/admin/rents` — список аренд, редактирование, продление, смена статуса, оплата.
- `/admin/bike-stats` — статистика доходов по байкам.
- `/admin/contacts` — контакты.

## 6. Диспетчерская (`/admin/dispatch`)

### Файл

- `src/app/admin/dispatch/page.tsx` — клиентская страница, периодически обновляется каждые 30 сек.

### Что отображает

- Операционная и финансовая статистика.
- Форма новой заявки (`LeadForm`).
- Новые заявки с кнопкой «В работу».
- Активные/просроченные аренды с кнопками «Завершить», «+1 день», ссылки для связи.
- Возвращающиеся сегодня/завтра.
- Таймлайн загруженности на 14 дней.
- Выручка по дням и топ байков.
- Свободный транспорт и байки на сервисе.

### API данных

- `GET /api/admin/dashboard?days=7|30` — все данные для диспетчерской.
- `POST /api/admin/overdue` — помечает просроченные аренды.

### Действия на диспетчерской

- `takeLead` — `PATCH /api/admin/leads/:id` → `{ status: 'IN_PROGRESS' }`.
- `completeRent` — `PATCH /api/admin/rents/:id` → `{ status: 'COMPLETED' }`.
- `extendRent` — `PATCH /api/admin/rents/:id` → `{ extendDays: 1 }`.
- `markOverdue` — `POST /api/admin/overdue`.

## 7. Аренды и заявки

### Создание аренды

- `src/lib/rent.ts` — `createRent` выполняет атомарную транзакцию:
  1. Проверяет `bike.status === 'FREE'`.
  2. Создаёт `Rent` со статусом `ACTIVE`.
  3. Создаёт `Payment` со статусом `PENDING`.
  4. Меняет `bike.status` на `RENTED`.
  5. Транзакция с `{ maxWait: 10000, timeout: 60000 }`.

### Обновление аренды

- `src/app/api/admin/rents/[id]/route.ts`:
  - Смена статуса: `RETURNED`, `COMPLETED`, `CANCELLED`, `OVERDUE`, `ACTIVE`.
  - Продление: `extendDays`, `extendBikeId`, `extendPrice`.
  - Ручная замена байка: `bikeId`.
  - Корректировка дат, цены, комментария.
  - Обновление платежа: `paymentStatus`, `paymentMethod`.

### Последние правки в арендах

- `tx.rent.update` без `include`; связи загружаются после коммита транзакции.
- Защита от отсутствующего байка (`rent.bike === null`).
- Освобождение старого байка через `updateMany`.

### Заявки

- `src/app/api/admin/leads/route.ts` — GET/POST заявок.
- `src/app/api/admin/leads/[id]/route.ts` — PATCH заявки.
- `src/app/api/admin/leads/[id]/convert/route.ts` — конвертация заявки в аренду.
- Статусы: `NEW`, `IN_PROGRESS`, `CONFIRMED`, `REJECTED`.

## 8. Личный кабинет курьера

### Страницы

- `src/app/login/page.tsx` — двухрежимный вход: курьер (email/phone + пароль) или администратор (username + password).
- `src/app/dashboard/page.tsx` — ЛК курьера, показывает активную аренду или предлагает перейти в каталог.
  - `src/app/dashboard/components/ActiveRentView.tsx` — активная аренда.
  - `src/app/dashboard/components/NoRentView.tsx` — нет аренды.
  - `src/app/dashboard/components/BikeSpecs.tsx`, `BikeStatus.tsx`, `WaterproofBadge.tsx`.
- `src/app/profile/page.tsx` — тестовый профиль с вводом телефона вручную (для разработки).
- `src/app/register/page.tsx` и `src/app/verify-email/page.tsx` — регистрация и подтверждение.

### API

- `POST /api/auth/courier/login` — авторизация по email или phone, устанавливает `courier_session`.
- `GET /api/courier/me` — профиль + последняя активная аренда.
- `POST /api/user/rent` — оформление аренды из ЛК (требует `courier_session`).
- `POST /api/auth/courier/register` и `GET /api/auth/courier/verify` — регистрация и верификация email.
- Email через Yandex SMTP не работает на сервере (закрыты исходящие порты), ссылка пишется в `journalctl`.

## 9. Публичный сайт

- `src/app/page.tsx` — клиентская главная, подгружает байки через `fetch('/api/bikes')`.
- `src/app/api/bikes/route.ts` — отдаёт все велосипеды.
- `src/components/CompactCatalog.tsx` и `src/app/(landing)/BikeCard.tsx` — карточки каталога.
- `public/images/` — фотографии; имена содержат пробелы и кириллицу, `src/lib/image.ts` нормализует URL.

## 10. Вспомогательные модули

- `src/lib/validation.ts` — Zod-схемы: `createBikeSchema`, `updateBikeSchema`, `leadStatus`, `updateLeadSchema`, `createLeadSchema`, `createLeadManualSchema`, `createOrderSchema`.
- `src/lib/bikeStatus.ts` — константы и лейблы `BIKE_STATUSES`, `BIKE_STATUS_LABELS`.
- `src/lib/leadStatus.ts` — константы и лейблы `LEAD_STATUSES`, `LEAD_STATUS_LABELS`.
- `src/lib/contact.ts` — `upsertContactByPhone`, дедупликация по нормализованным цифрам телефона через `REGEXP_REPLACE`.
- `src/lib/messenger.ts` — `sendNotification` через MAX API или Telegram, `buildMaxLink`.
- `src/lib/overdue.ts` — `markOverdueRents`, рассылает уведомления.
- `src/lib/prisma.ts` — singleton `PrismaClient`.
- `src/lib/session.ts` — `createAdminSessionToken`, `verifyAdminSessionToken`.
- `src/lib/password.ts` — хеширование и проверка паролей.
- `src/lib/rate-limit.ts` — rate limiter для авторизации (`lru-cache`).

## 11. Последние изменения (актуально)

- Расчёт дней в статистике (`src/app/api/admin/bikes/stats/route.ts`): `actualReturnDate` используется только для `RETURNED`/`COMPLETED`, `overlapDays` без `+1`.
- Продление аренды с заменой байка и ручной стоимостью.
- Поиск/выбор контактов в `LeadForm` (`src/components/admin/LeadForm.tsx`).
- Исправлен статус `CONFIRMED` в `src/lib/validation.ts`.
- Увеличены таймауты Prisma-транзакций в `src/lib/rent.ts` и `src/app/api/admin/rents/[id]/route.ts`.
- Исправлен MySQL `Lock wait timeout` (`code 1205`): `tx.rent.update` без `include`, связи загружаются после коммита транзакции.
- Добавлена защита от `rent.bike === null` при завершении/продлении.

## 12. Планы по доработке

- **Диспетчерская:**
  - мобильная адаптация (меню, карточки, touch-targets, таблицы);
  - возможно PWA / мобильное приложение.
- **Личный кабинет курьера:**
  - довести `/dashboard` до production-качества;
  - интеграция `/profile` с реальной сессией;
  - функция сдачи/возврата байка;
  - уведомления и баланс.

## 13. Команды

### Локально

```powershell
cd "C:\xampp\htdocs\ebike-rent"
npm run typecheck
npm run dev
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

### Проверка после деплоя

```bash
systemctl is-active elbiko
systemctl status elbiko -n 20
curl -I http://127.0.0.1:3000
curl -s http://127.0.0.1:3000/api/bikes | head -c 100
curl -I http://127.0.0.1:3000/admin/rents
curl -I http://127.0.0.1:3000/admin/leads
```

## 14. Важные ограничения и подводные камни

- `public/images/` содержит файлы с пробелами и кириллицей; `normalizeImageUrl` не должен заменять пробелы на дефисы.
- Перед каждым продакшен-билдом нужно `rm -rf .next`.
- VPS сильно ограничен по RAM/swap; при `SIGKILL` уменьшить `NODE_OPTIONS` до `1280`.
- Yandex SMTP не работает на сервере; email-верификация пишет ссылку в лог.
- `AdminShell` имеет фиксированный сайдбар `w-64` — не работает на мобильных без переделки.
- Таблицы в `/admin` и `/admin/rents` не адаптированы под телефоны.
