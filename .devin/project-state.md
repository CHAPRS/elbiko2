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

- Next.js `14.2.35`, React `18`, TypeScript `5.9.3`, Tailwind CSS `3.4.1`.
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

- `Bike` — `id`, `name`, `speed`, `range`, `motor`, `battery`, `isWaterproof`, `status`, `pricePerDay`, `externalId`, `imageUrl`, `purchasePrice`, `purchaseDate`, `mileage`.
  - Статусы: `FREE`, `RENTED`, `MAINTENANCE`, `BLOCKED`.
- `User` — `id`, `phone` (unique), `password`, `name`, `balance`, `telegramChatId`, `maxChatId`, `preferredMessenger`, `email`, `emailVerified`, `emailVerificationToken`.
- `Rent` — `id`, `userId`, `bikeId`, `startDate`, `endDate`, `actualReturnDate`, `totalPrice`, `isActive`, `status`.
  - Статусы: `ACTIVE`, `RETURNED`, `COMPLETED`, `CANCELLED`, `OVERDUE`.
- `Payment` — `rentId` (unique), `amount`, `status` (`PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`), `paymentMethod`, `paidAt`.
- `RentTransaction` — `rentId`, `type` (`PAYMENT`, `EXTEND`, `REFUND`, `PENALTY`, `DEPOSIT`), `amount`, `method`, `comment`.
- `Lead` — `id`, `name`, `phone`, `bikeName`, `status` (`NEW`, `IN_PROGRESS`, `CONFIRMED`, `REJECTED`), `message`, `comment`, `rejectReason`, `rentDays`, `totalPrice`, `startDate`, `endDate`, `bikeId`.
- `Contact` — `id`, `firstName`, `lastName`, `phone` (unique-ish), `email`, `status`, `source`, `notes`, `lastContactAt`.
- `RentalSession` — устаревающая модель сессий, пока дублирует логику.
- `MiscTransaction` — прочие доходы/расходы вне аренды: `kind` (`INCOME`/`EXPENSE`), `title`, `amount`, `method`, `bikeId?`, `comment`.
- `MileageLog` — журнал пробега: `bikeId`, `rentId?`, `mileage`, `note`, `createdAt`. Текущее значение дублируется в `Bike.mileage`.
- `Buyout` — аренда под выкуп: `title`, `clientName`, `clientPhone`, `bikeId?`, `totalPrice`, `status` (`ACTIVE`, `COMPLETED`, `CANCELLED`), `startDate`, `comment`.
- `BuyoutPayment` — строка графика выкупа: `buyoutId`, `dueDate`, `amount`, `status` (`PENDING`, `PAID`), `paidAt`, `method`, `comment`.
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

- Операционная и финансовая статистика (включая прочие доходы, расходы, доход по выкупам, прибыль за период).
- Форма новой заявки (`LeadForm`).
- «Прочие операции» — форма доход/расход (предмет, сумма, способ оплаты, привязка к байку) + последние операции с правкой/удалением.
- «Аренда под выкуп» (`BuyoutSection`) — создание с авто/ручным/пустым графиком платежей, редактирование графика, отметка оплат.
- Новые заявки с кнопкой «В работу».
- Активные/просроченные аренды с кнопками «Завершить», «+1 день» (обе через `MileagePrompt` — пробег необязателен), ссылки для связи.
- Возвращающиеся сегодня/завтра.
- Таймлайн загруженности на 14 дней.
- Выручка по дням (аренда + прочие доходы + выкупы + расходы) и топ байков.
- Свободный транспорт и байки на сервисе (с пробегом и кнопкой «Пробег»).

### API данных

- `GET /api/admin/dashboard?days=7|30` — все данные для диспетчерской.
- `POST /api/admin/overdue` — помечает просроченные аренды.

### Действия на диспетчерской

- `takeLead` — `PATCH /api/admin/leads/:id` → `{ status: 'IN_PROGRESS' }`.
- `convertRent` — `POST /api/admin/leads/:id/convert` → `{ bikeId, days, totalPrice, startDate, endDate }`. Кнопка «Оформить» открывает модалку с выбором байка, срока и цены.
- `completeRent` — `PATCH /api/admin/rents/:id` → `{ status: 'COMPLETED', mileage? }`.
- `extendRent` — `PATCH /api/admin/rents/:id` → `{ extendDays: 1, mileage? }`.
- `markOverdue` — `POST /api/admin/overdue`.
- Прочие операции: `GET/POST /api/admin/finance`, `PATCH/DELETE /api/admin/finance/:id`.
- Пробег: `mileage` в `PATCH /api/admin/rents/:id` (пишет `MileageLog` + `Bike.mileage`, возвращает `mileageWarning` при уменьшении); `POST/GET /api/admin/bikes/:id/mileage` — внесение в любое время и история.
- Выкупы: `GET/POST /api/admin/buyouts` (авто-график через `schedule{firstDate,count,interval}` или явный `payments[]`); `PATCH/DELETE /api/admin/buyouts/:id`; `POST /api/admin/buyouts/:id/payments`; `PATCH/DELETE /api/admin/buyout-payments/:id` (оплаченные не удаляются).

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
  - Обновление платежа: `paymentStatus`, `paymentMethod`. Если `Payment` отсутствует — создаётся новый (upsert); если есть — обновляется.

### Последние правки в арендах

- `tx.rent.update` без `include`; связи загружаются после коммита транзакции.
- Защита от отсутствующего байка (`rent.bike === null`).
- Освобождение старого байка через `updateMany`.
- Валидация сумм: `extendPrice`, `totalPrice`, `paymentAmount` проверяются на `Number.isFinite` и неотрицательность — это предотвращает `NaN`/`Infinity` и падение `prisma.rentTransaction.create()`.
- API возвращает точный текст ошибки (`error.message`) в ответе, чтобы в UI видеть реальную причину, а не только «Ошибка при обновлении аренды».
- Для аренд без `Payment` кнопка «Оплатить» в `/admin/rents` теперь отображается (`!rent.payment || rent.payment.status !== 'COMPLETED'`).

### Конвертация заявки в аренду

- `src/app/api/admin/leads/[id]/convert/route.ts` теперь принимает `days`, `totalPrice`, `startDate`, `endDate` из тела запроса, с fallback на поля заявки.
- Логика: upsert `User` по телефону → `createRent` (атомарно создаёт `Rent` + `Payment` + меняет `bike.status` на `RENTED`) → upsert `Contact` → `lead.status = 'CONFIRMED'`, `lead.rentId = createdRent.id`.
- Из диспетчерской доступно через кнопку «Оформить» у новой заявки.

### Заявки

- `src/app/api/admin/leads/route.ts` — GET/POST заявок.
- `src/app/api/admin/leads/[id]/route.ts` — PATCH заявки.
- `src/app/api/admin/leads/[id]/convert/route.ts` — конвертация заявки в аренду (см. выше).
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

- **2026-09-30** — диспетчерская: прочие операции, пробег, выкуп:
  - `MiscTransaction` — учёт доходов/расходов вне аренды (`/api/admin/finance`), секция «Прочие операции»;
  - `MileageLog` + `Bike.mileage` — пробег при завершении/продлении/возврате (опционально, `MileagePrompt`) и в любое время (`POST /api/admin/bikes/:id/mileage`); заниженный пробег принимается с `mileageWarning`;
  - `Buyout` + `BuyoutPayment` — аренда под выкуп с редактируемым графиком платежей (`/api/admin/buyouts`, `/api/admin/buyout-payments/:id`), секция в диспетчерской;
  - `Bike.purchasePrice`/`purchaseDate` — поля в форме `/admin`, колонка «Пробег» в таблице автопарка;
  - `GET /api/admin/dashboard` отдаёт `miscIncome*`, `expenses*`, `buyoutIncome*`, `netProfitPeriod`, `revenueByDay[].misc|expense|buyout`, `recentMisc`, `bikes`, `buyouts`.
- **2025-09-30** — `fix(admin/rents): валидация сумм при продлении/оплате и точные ошибки в UI` (`113ca5e`):
  - проверяем, что `additionalPrice`, `newTotalPrice`, `finalPaymentAmount` — конечные неотрицательные числа;
  - защита от `NaN`/`Infinity`, которые приводили к `prisma.rentTransaction.create()` `ConnectorError`;
  - `PATCH /api/admin/rents/:id` теперь возвращает `error.message`, а не общее «Ошибка при обновлении аренды».
- **2025-09-30** — `feat(dispatch, rents): конвертация заявки в аренду из диспетчерской и upsert платежа` (`0c98287`):
  - в `/admin/dispatch` появилась кнопка «Оформить» с модалкой конвертации заявки;
  - `POST /api/admin/leads/:id/convert` принимает `days`, `totalPrice`, `startDate`, `endDate`;
  - `PATCH /api/admin/rents/:id` делает upsert `Payment` и создаёт `RentTransaction` для `COMPLETED`/`REFUNDED`;
  - `/admin/rents` показывает кнопку «Оплатить» для аренд без `Payment` и выводит ошибки.
- Расчёт дней в статистике (`src/app/api/admin/bikes/stats/route.ts`): `actualReturnDate` используется только для `RETURNED`/`COMPLETED`, `overlapDays` без `+1`.
- Продление аренды с заменой байка и ручной стоимостью.
- Поиск/выбор контактов в `LeadForm` (`src/components/admin/LeadForm.tsx`).
- Исправлен статус `CONFIRMED` в `src/lib/validation.ts`.
- Увеличены таймауты Prisma-транзакций в `src/lib/rent.ts` и `src/app/api/admin/rents/[id]/route.ts`.
- Исправлен MySQL `Lock wait timeout` (`code 1205`): `tx.rent.update` без `include`, связи загружаются после коммита транзакции.
- Добавлена защита от `rent.bike === null` при завершении/продлении.

## 12. Текущее состояние и остаточные задачи

- **Продакшен:** последний деплой был прерван:
  1. `SIGKILL` при `npx next build` из-за нехватки RAM.
  2. `No space left on device` из-за забитого диска (`/dev/vda2` 9.8G на 100%).
- **После очистки диска** нужно повторить деплой по командам ниже.
- **Возможный backfill:** `prisma/seed.ts` создаёт `Rent` без `Payment`. Если в проде есть старые аренды без платежа, выполнить:
  ```sql
  INSERT INTO Payment (rentId, amount, status, createdAt, updatedAt)
  SELECT r.id, r.totalPrice, 'PENDING', NOW(), NOW()
  FROM Rent r
  LEFT JOIN Payment p ON p.rentId = r.id
  WHERE p.id IS NULL;
  ```

### Планы по доработке

- **Диспетчерская:** мобильная адаптация (меню, карточки, touch-targets, таблицы); возможно PWA.
- **Личный кабинет курьера:** довести `/dashboard` до production-качества; интеграция `/profile` с реальной сессией; функция сдачи/возврата байка; уведомления и баланс.

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
# Убедиться, что на диске есть место (df -h)
git pull origin master
npx prisma db push   # новые таблицы/поля — изменения аддитивные, данные не затрагиваются
npx prisma generate
systemctl stop elbiko
rm -rf .next
NODE_OPTIONS=--max-old-space-size=1280 npx next build
systemctl daemon-reload
systemctl start elbiko
systemctl status elbiko -n 20
```

Если сборка упадёт с `SIGKILL` — увеличить swap и повторить с `NODE_OPTIONS=--max-old-space-size=1024`.

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
- VPS сильно ограничен по RAM/swap; при `SIGKILL` уменьшить `NODE_OPTIONS` до `1280` или `1024`.
- Диск `/dev/vda2` (9.8G) забит под 100% — перед `git pull`/`build` нужно освобождать место (`/var/log/journal`, `/var/www/elbiko/.next`, `/var/cache/apt`, npm-кэш).
- Yandex SMTP не работает на сервере; email-верификация пишет ссылку в лог.
- `AdminShell` имеет фиксированный сайдбар `w-64` — не работает на мобильных без переделки.
- Таблицы в `/admin` и `/admin/rents` не адаптированы под телефоны.
- Не коммитить `.env`, `admin_cookie.txt`, `login.json` — в них могут быть токены/пароли. Локально лежат в корне репозитория как untracked.
- Локальная MySQL (XAMPP) содержит тестовые данные; на проде могут быть аренды без `Payment` — см. backfill в разделе 12.
