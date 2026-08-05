# Настройка Strapi Cloud для ELBIKO

## 🌐 Шаг 1: Создание проекта Strapi Cloud

1. Перейдите на **https://cloud.strapi.io/**
2. Нажмите кнопку **"Create your account"** или **"Sign up"**
3. Зарегистрируйтесь (можно через GitHub, Google или email)
4. После регистрации нажмите **"Create new project"**
5. Введите название проекта: **elbiko**
6. Выберите регион (ближе к вам - Europe или Asia)
7. Выберите план: **Free** (бесплатный)
8. Нажмите **"Create project"**

## ⏳ Шаг 2: Ожидание создания проекта

Strapi создаст проект в течение 1-2 минут. После создания:

1. Вы получите URL вашего проекта (например: `https://elbiko.strapi.io`)
2. Сохраните этот URL - он понадобится для подключения
3. Сохраните API URL (обычно: `https://elbiko.strapi.io/api`)

## 🎨 Шаг 3: Настройка Content Types

В Strapi Cloud перейдите в **Content-Type Builder**:

### 1. Создайте Content Type "Hero"

1. Нажмите **"Create new collection type"**
2. Название: **Hero**
3. Добавьте поля:
   - **title** (Text)
   - **subtitle** (Text, Long text)
   - **badge** (Text)
   - **stat1_label** (Text)
   - **stat1_value** (Text)
   - **stat2_label** (Text)
   - **stat2_value** (Text)
   - **stat3_label** (Text)
   - **stat3_value** (Text)
   - **cta_text** (Text)
   - **cta_link** (Text)
   - **secondary_cta_text** (Text)
   - **secondary_cta_link** (Text)
4. Нажмите **"Save"**

### 2. Создайте Content Type "Tariff"

1. Нажмите **"Create new collection type"**
2. Название: **Tariff**
3. Добавьте поля:
   - **name** (Text)
   - **subtitle** (Text)
   - **price** (Number, Integer)
   - **period** (Text)
   - **popular** (Boolean, default: false)
   - **order** (Number, Integer)
   - **features** (JSON или Text - для списка преимуществ)
4. Нажмите **"Save"**

### 3. Создайте Content Type "Review"

1. Нажмите **"Create new collection type"**
2. Название: **Review**
3. Добавьте поля:
   - **author** (Text)
   - **platform** (Text)
   - **duration** (Text)
   - **rating** (Number, Integer, min: 1, max: 5)
   - **text** (Text, Long text)
   - **order** (Number, Integer)
4. Нажмите **"Save"**

### 4. Создайте Content Type "Faq"

1. Нажмите **"Create new collection type"**
2. Название: **Faq**
3. Добавьте поля:
   - **question** (Text)
   - **answer** (Text, Long text)
   - **order** (Number, Integer)
4. Нажмите **"Save"**

### 5. Создайте Content Type "Bike"

1. Нажмите **"Create new collection type"**
2. Название: **Bike**
3. Добавьте поля:
   - **name** (Text)
   - **description** (Text, Long text)
   - **price** (Number, Integer)
   - **range** (Text)
   - **speed** (Text)
   - **power** (Text)
   - **image** (Media, Single image)
   - **available** (Boolean, default: true)
   - **order** (Number, Integer)
4. Нажмите **"Save"**

## 🔓 Шаг 4: Настройка прав доступа

1. Перейдите в **Settings** → **Users & Permissions** → **Roles** → **Public**
2. Для каждого созданного Content Type:
   - Отметьте **find** и **findOne**
3. Нажмите **"Save"**

## 📝 Шаг 5: Создание контента

Перейдите в **Content Manager**:

### Hero секция:
1. Нажмите **"Create new entry"** в разделе **Hero**
2. Заполните поля:
   ```
   title: Аренда электровелосипедов для курьеров
   subtitle: Доставляй быстрее. Зарабатывай больше.
   badge: Для Курьеров
   stat1_label: км без подзарядки
   stat1_value: 50+
   stat2_label: больше заказов
   stat2_value: 2×
   stat3_label: тарифа аренды
   stat3_value: 3
   cta_text: Выбрать тариф
   cta_link: #tariffs
   secondary_cta_text: Смотреть каталог
   secondary_cta_link: #catalog
   ```
3. Нажмите **"Save"** → **"Publish"**

### Тарифы:
Создайте 3 записи в разделе **Tariff** (как описано в предыдущей инструкции для Sanity)

### Отзывы:
Создайте записи в разделе **Review**

### FAQ:
Создайте записи в разделе **Faq**

### Велосипеды:
Создайте записи в разделе **Bike**

## 🔗 Шаг 6: Подключение к Next.js

После создания проекта и контента сообщите мне:
1. URL вашего Strapi проекта
2. API URL

Я создам компоненты для интеграции Strapi с вашим Next.js сайтом.

## 🎯 Преимущества Strapi Cloud:

✅ **Бесплатный тариф** - до 3 проектов, 500MB хранилища  
✅ **Простой интерфейс** - интуитивный веб-редактор  
✅ **Мощное API** - REST и GraphQL  
✅ **Гибкая настройка** - любые поля и связи  
✅ **Быстрое развертывание** - за несколько минут  
✅ **Надежная инфраструктура** - 99.9% uptime