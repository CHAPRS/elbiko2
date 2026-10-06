# Elbiko — срез проекта для продолжения работы

> Обновлено: 2026-10-05. Последний коммит `437d367` — запушен и задеплоен на прод.

## 1. Общее

- **Назначение:** сайт и ERP для аренды электровелосипедов курьерам в Оренбурге.
- **Репозиторий:** `https://github.com/CHAPRS/elbiko2`, ветка `master`.
- **Локально:** `C:\xampp\htdocs\ebike-rent` (Windows, XAMPP, MySQL `elbiko`).
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

- `next.config.mjs` — отключён `poweredByHeader`, image remotePatterns, security headers.
- `src/middleware.ts` — CORS для `/api`; `admin_session` для `/api/admin` и `/admin`; `courier_session` для `/dashboard`; редиректы `/login`.
- `src/app/constants.ts` — `CONTACTS` (единый источник контактов): `phone`, `telegramManager` (`t.me/ElBaiko`), `telegramChannel` (`t.me/ElBaiko56`), `telegramBot`, `maxUrl`.

### Сессии

- **Админ:** `admin_session` = HMAC-SHA256 (`ADMIN_PASSWORD`), payload `{type:'admin', role:'OWNER'}` (`src/lib/session.ts`).
- **Курьер:** `courier_session` = строковый `userId`.

## 4. База данных (`prisma/schema.prisma`)

### Ключевые модели

- `Bike` — `id`, `name`, `status` (`FREE`, `RENTED`, `MAINTENANCE`, `BLOCKED`), `pricePerDay`, `externalId`, `purchasePrice`, `purchaseDate`, `mileage`, `serviceIntervalKm`, `lastServiceMileage`.
- `User` — `id`, `phone` (unique), `password`, `name`, `balance`, email-поля, мессенджеры.
- `Rent` — `startDate`, `endDate`, `actualReturnDate`, `totalPrice`, `isActive`, `status` (`ACTIVE`, `RETURNED`, `COMPLETED`, `CANCELLED`, `OVERDUE`), `comment`, **`debtDueDate`** (планируемая дата погашения долга).
- `Payment` — `rentId` (unique), `amount`, `status` (`PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`), `paymentMethod`, `paidAt`.
- `RentTransaction` — **денежный журнал аренды**: `type` (`PAYMENT`, `EXTEND`, `REFUND`, `PENALTY`, `DEPOSIT`), `amount`, `method`, `comment`, `createdAt`.
- `MiscTransaction` — `kind` (`INCOME`/`EXPENSE`), `title`, `amount`, `method`, **`category`** (`REPAIR`, `SERVICE`, `BATTERY`, `BATTERY_RENT`, `ACCESSORIES`, `GOODS`, `PARTS`, `OTHER`), `bikeId?`, `comment`.
- `MileageLog` — `bikeId`, `rentId?`, `mileage`, `note`.
- `Buyout` + `BuyoutPayment` — аренда под выкуп с графиком платежей (`PENDING`/`PAID`, `dueDate`, `paidAt`, `method`).
- **`Part`** — складская номенклатура: `name`, `sku`, `category` (текст), `unit`, `stockQty`, `minQty`, `lastPrice`, `comment`.
- **`PartTransaction`** — складской журнал: `kind` (`IN`/`OUT`/`ADJUST`), `qty`, `price`, `bikeId?`, `miscTransactionId?`, `comment`.
- `Lead`, `Contact`, `RentalSession` (legacy), CMS-модели (`Hero`, `Feature`, `Step`, `Tariff`, `Review`, `FAQ`).

### Модель учёта денег по аренде (важно!)

- `paidTotal` = Σ `RentTransaction`(PAYMENT) − Σ(REFUND) — реально внесённые деньги;
- `debt` = `totalPrice` − `paidTotal` — **вычисляется**, не хранится;
- «Долг» показывается в UI только если `debt > 0` **и** (`paidTotal > 0` или задан `debtDueDate`) — полностью неотмеченная оплата (PENDING) долгом не считается;
- `paymentStatus='COMPLETED'` в PATCH пишет PAYMENT-транзакцию **на остаток** (`totalPrice − paidSoFar`), не на полную сумму — защита от двойного счёта;
- выручка в dashboard и P&L считается по журналу по `createdAt` (реальная дата поступления);
- `prisma/backfill-rent-txns.ts` — одноразовый скрипт, досоздаёт PAYMENT-транзакции для старых COMPLETED-платежей без записей в журнале. На проде отработал: все 12 платежей покрыты.

### Склад запчастей — вариант B (расход при установке)

- `IN` (приход) — только движение склада, расходом НЕ считается;
- `OUT` (списание на байк) — создаёт `MiscTransaction` EXPENSE категории `PARTS` на сумму qty×price → попадает в расходы байка, P&L, категории;
- `ADJUST` — корректировка остатка, qty со знаком (дельта);
- `Bike.purchasePrice`/`purchaseDate` — закупка байка не является операционным расходом, идёт в окупаемость.

## 5. Админка

### Навигация (`AdminShell`)

- `/admin/dispatch` — Диспетчерская
- `/admin` — Автопарк
- `/admin/parts` — **Склад**
- `/admin/bike-stats` — Статистика
- `/admin/leads` — Заявки
- `/admin/rents` — Аренды
- `/admin/contacts` — Контакты

### Диспетчерская (`/admin/dispatch`)

- Финансовые карточки: выручка сегодня/период (всё по источникам), аренда, ожидаемая/просроченная, средний чек, прочие доходы, выкупы, расходы, прибыль, остаток по выкупам, склад.
- «Доходы по способам оплаты» и «Расходы по категориям» за период.
- «Должники»: просроченные аренды + просроченные платежи выкупов + **«Доплата»** (частично оплаченные аренды с долгом — фиолетовый бейдж, дата погашения).
- «Платежи по выкупам на ближайшие 7 дней».
- «Топ клиентов» и «Топ байков» за период.
- Карточки аренд: завершить/+1 день (через `MileagePrompt`), «+ Оплата» при долге (модал: сумма, способ, дата погашения), бейдж «Долг X ₽ до Y».
- «Прочие операции» с категорией и привязкой к байку.
- Секция «Аренда под выкуп» + сворачиваемый архив (COMPLETED/CANCELLED).
- ТО по пробегу: на карточках байков «до ТО X км» / «ТО просрочено» + кнопка «ТО проведено`.
- График выручки по дням — ключи по локальной дате сервера (UTC-фикс сделан).

### Страница аренд (`/admin/rents`)

- Модал продления: дни, замена байка, стоимость, пробег + блок «Оплата продления» (Позже/Полностью/Частично; частичная требует дату погашения остатка).
- В строке: «долг X ₽ до Y» при реальном долге; «+ Оплата».
- «Оплатить» со способом — для неотмеченных платежей (старое поведение сохранено).

### Страница статистики (`/admin/bike-stats`)

- По байкам за период: аренды, дни, выручка, расходы (раскрытие детализации), прибыль, закупка, пробег, окупаемость (прогресс-бар), ремонтов N на X ₽.
- «Расходы по категориям» за период.
- **Помесячный P&L** (`GET /api/admin/pnl`): пресеты 6/12/24/всё + произвольный диапазон `from=YYYY-MM&to=YYYY-MM`; колонки Аренда/Прочие/Выкупы/Итого/Расходы/Прибыль.

### Склад (`/admin/parts`)

- Сводка: позиций / единиц / сумма запаса.
- Таблица с действиями: Приход, Списать (с байком), Корр., История (раскрытие), Ред., Удал.
- `minQty` заложен в схеме, UI-напоминаний пока нет.

## 6. API

- `GET /api/admin/dashboard?days=N` — весь дашборд; аренды содержат `paidTotal`, `debt`, `debtDueDate`; `stats.rentDebt` — только реальные долги.
- `PATCH /api/admin/rents/[id]` — принимает `paidAmount`, `paidMethod`, `debtDueDate`; ответ содержит `paidTotal`, `debt`, `overpaid`, `mileageWarning`.
- `GET /api/admin/rents` — аренды с `paidTotal`/`debt` (вычисляются из журнала).
- `GET /api/admin/pnl?months=N|from=YYYY-MM&to=YYYY-MM` — помесячный отчёт.
- `GET/POST /api/admin/parts`, `PATCH/DELETE /api/admin/parts/[id]`, `GET/POST /api/admin/parts/[id]/transactions`.
- `GET/POST /api/admin/finance`, `PATCH/DELETE /api/admin/finance/[id]` — прочие операции.
- `GET/POST /api/admin/buyouts`, `PATCH/DELETE /api/admin/buyouts/[id]`, `POST /api/admin/buyouts/[id]/payments`, `PATCH/DELETE /api/admin/buyout-payments/[id]`.
- `POST/GET /api/admin/bikes/[id]/mileage`, `POST /api/admin/overdue`, `GET /api/admin/bikes/stats`.
- `POST /api/admin/leads/[id]/convert` — конвертация заявки в аренду.

## 7. История итераций (коммиты)

- `7cefd7c` — прочие операции, пробег, выкуп (базовый ERP-набор).
- `edc9570` — общая выручка, расходы и окупаемость по байкам, разбивка по способам оплаты.
- `a0b55e9` — должники, категории операций, ТО по пробегу, архив выкупов.
- `48e5c03` — частота поломок, топ клиентов, платежи выкупов на неделю.
- `0fac2c9` — помесячный P&L с произвольным периодом.
- `7a2f1b7` — частичная оплата продления, долг, `RentTransaction`-журнал, backfill-скрипт.
- `141f655` — склад запчастей (`Part`/`PartTransaction`, вариант B).
- `2ad8a0e` — фикс: долг показывается только при частичной оплате/сроке погашения.
- `bd9bbc4` — docs: актуализация project-state.md.
- `7217bd1` — ссылка на Telegram-канал: иконка в шапке, пункты меню «Связаться», колонка «Мы в соцсетях» в футере (вместо «Документы»).
- `437d367` — фикс: меню «Связаться» закрывается по клику вне и Escape.

## 8. Продакшен — состояние

- Схема на проде синхронизирована (`db push` → `in sync`): `Part`, `PartTransaction`, `Rent.debtDueDate`, `MiscTransaction.category`, `Bike.serviceIntervalKm`, `Bike.lastServiceMileage`.
- Backfill на проде: «создано 0, пропущено 12 из 12» — журнал полный.
- **Диск `/dev/vda2` 9.8G — критически мал, был инцидент «disk is full».** Карта расхода (2026-10-05): swap-файлы `/swapfile`+`/swap2`+`/swapfile2` = 2.5G (не трогать, RAM ограничена), `/usr` 3.3G, `node_modules` 1.4G, `.next` ~636M (из них `cache/webpack` ~466M — мусор для рантайма), `/var/lib/apt` ~391M, `/var/log/journal` ~137M (поставлен лимит `SystemMaxUse=50M`), `.git` ~118M.
- Безопасная чистка: `rm -rf /var/www/elbiko/.next/cache`, `journalctl --vacuum-size=30M`, `apt clean` + `rm -rf /var/lib/apt/lists/*` + `apt autoremove --purge` (когда apt не залочен unattended-upgrades), `git gc --prune=now`.
- Деплой до `437d367` выполнен 2026-10-05: на проде TG-канал в шапке/футере + фиксы `2ad8a0e` и `437d367`. Проверено: `ElBaiko56` в HTML, `/admin` → 307, `/api/bikes` → 200.

### Деплой

```bash
cd /var/www/elbiko
df -h                                  # сначала проверить место! нужно ~700M-1G свободно
mysqldump -u root <база> > /var/backups/elbiko_$(date +%Y%m%d).sql
git pull origin master
npx prisma db push                     # только если схема менялась
npx prisma generate
systemctl stop elbiko && rm -rf .next
NODE_OPTIONS=--max-old-space-size=1536 npx next build
rm -rf .next/cache                     # ~460M webpack-кэша, рантайму не нужен
systemctl start elbiko
systemctl status elbiko -n 20
```

## 9. Бэклог

### Функционал

- **Мин. остаток/напоминания склада** — поле `minQty` есть, нужен UI-фильтр «заканчивается» и подсветка в диспетчерской.
- **Экспорт CSV** — финансовый отчёт за период (дата, источник, предмет, категория, сумма, способ).
- **Залоги (депозиты)** — ответ пользователя не получен; `DEPOSIT` тип заложен в `RentTransaction`.
- **Поставщики/FIFO** на складе — потом.

### Техдолг

- Мобильная адаптация админки (сайдбар `w-64` фиксированный, таблицы широкие).
- SMTP на проде закрыт провайдером — ссылки подтверждения в `journalctl`; решения: переезд VPS или почтовый HTTP API.
- ЛК курьера: возврат байка, история в `/dashboard`.

### Хозяйство

- `admin_cookie.txt`, `nul` — локальные untracked-артефакты, не коммитить.
- Локальная БД содержит тестовые данные (складская позиция, тестовые расходы, выкуп «Test Client»).

## 10. Правила и предпочтения

- Общение на русском.
- Всегда `npm run typecheck` + прогон на localhost перед пушем.
- Миграции только аддитивные (nullable-колонки, новые таблицы); перед деплоем `mysqldump`.
- Не коммитить `.env`, секреты, `admin_cookie.txt`.
- Пушить в `origin/master`; не пушить без подтверждения деплоя — код может жить в репо раньше прода.
- Коммит-стиль: `feat(scope): описание` / `fix(scope): описание` + трейлеры Devin.
