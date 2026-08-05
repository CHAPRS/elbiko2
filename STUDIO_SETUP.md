# Запуск Sanity Studio отдельным приложением

## Вариант 1: Sanity Studio как отдельное приложение

Если интеграция с Next.js не работает, можно запустить Sanity Studio отдельно:

### 1. Установите Sanity CLI глобально:
```bash
npm install -g @sanity/cli
```

### 2. Создайте отдельную папку для Sanity Studio:
```bash
cd C:\xampp\htdocs
npx @sanity/cli init
```

Выберите:
- **Create new project**: Yes
- **Use project template**: "Clean project with no predefined schemas"
- **Project name**: elbiko-studio
- **Use the default dataset configuration**: Yes

### 3. Скопируйте ваш существующий project ID:
Ваш текущий project ID: `9qjrff3g`

### 4. Настройте схемы данных:
Скопируйте файлы схем из вашего проекта в новую папку Sanity Studio:
- Скопируйте `C:\xampp\htdocs\ebike-rent\src\sanity\schemaTypes\*` в `C:\xampp\htdocs\elbiko-studio\schemas\`

### 5. Запустите Sanity Studio:
```bash
cd C:\xampp\htdocs\elbiko-studio
sanity start
```

Откройте http://localhost:3333

## Вариант 2: Исправление интеграции с Next.js

Если хотите использовать интеграцию с Next.js:

### 1. Установите зависимости:
```bash
cd C:\xampp\htdocs\ebike-rent
npm install --legacy-peer-deps
```

### 2. Убедитесь, что Next.js запущен:
```bash
npm run dev
```

### 3. Проверьте путь:
http://localhost:3000/studio

### 4. Если не работает, проверьте ошибки в консоли браузера

## Вариант 3: Использовать Sanity Desk напрямую

Самый простой вариант - использовать Sanity Desk (облачный редактор):

1. Перейдите на https://www.sanity.io/manage
2. Войдите в свой аккаунт Sanity
3. Выберите проект ELBIKO
4. Используйте облачный редактор для управления контентом

## Рекомендация:

Я рекомендую **Вариант 1** - создать отдельную Sanity Studio. Это даст вам:
- Отдельное приложение для управления контентом
- Стабильную работу независимо от Next.js
- Простой доступ к админ-панели на http://localhost:3333