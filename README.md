# ELBIKO — аренда электровелосипедов для курьеров

Next.js 14 (App Router) + Prisma + MySQL + Tailwind.

## Локальный запуск

```bash
npm install --legacy-peer-deps
cp .env.example .env          # заполнить значения
npx prisma migrate deploy
npm run seed                  # тестовые данные (опционально)
npm run dev
```

## Переменные окружения

| Переменная | Назначение |
| --- | --- |
| `DATABASE_URL` | строка подключения к MySQL |
| `TELEGRAM_TOKEN` | токен бота от @BotFather |
| `TELEGRAM_ADMIN_CHAT_ID` | chat_id админской группы для уведомлений о заявках |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | вход в админ-панель `/login` |

Без `ADMIN_PASSWORD` вход в админку возвращает ошибку конфигурации, без токена Telegram заявки
сохраняются в базу, но уведомления не отправляются.

## Скрипты

```bash
npm run dev        # дев-сервер
npm run build      # прод-сборка
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run seed       # наполнение базы тестовыми данными
```

## Админ-панель

- `/admin` — автопарк: создание, редактирование, смена статуса (`FREE` / `RENTED` / `MAINTENANCE`), удаление
- `/admin/leads` — заявки: фильтры по статусу, комментарии, причина отказа, конвертация заявки в аренду
- `/admin/rents` — аренды

Все `/api/admin/*` закрыты cookie-сессией `admin_session` (см. `src/middleware.ts`).
