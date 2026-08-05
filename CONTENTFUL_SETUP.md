# Настройка Contentful для ELBIKO

## 🌐 Шаг 1: Создание аккаунта Contentful

1. Перейдите на **https://www.contentful.com/sign-up/**
2. Зарегистрируйтесь (можно через GitHub, Google или email)
3. После регистрации выберите план: **Free** (бесплатный)
4. Нажмите **"Continue"**

## 📋 Шаг 2: Создание пространства (Space)

1. После входа в систему нажмите **"Create space"**
2. Введите название: **ELBIKO**
3. Выберите: **Empty space** (пустое пространство)
4. Нажмите **"Create space"**

## 🔑 Шаг 3: Получение API ключей

1. В верхнем меню перейдите в **Settings** → **API keys**
2. Нажмите **"Add API key"**
3. Заполните:
   - **Name**: ELBIKO Production
   - **Description**: Production API key for ELBIKO website
4. Нажмите **"Save"**
5. **Сохраните следующие данные** (они понадобятся для подключения):
   - **Space ID** (пример: `abc123def456`)
   - **Content Delivery API - access token** (длинный токен)
   - **Content Preview API - access token** (для preview mode)

## 🎨 Шаг 4: Создание Content Models

Перейдите в **Content model** в левом меню:

### 1. Создайте Content Model "Hero"

1. Нажмите **"Add content type"**
2. Название: **Hero**
3. Краткое описание: **Hero секция главной страницы**
4. Добавьте поля:

**Text field - title:**
- **Name**: title
- **Field ID**: title
- **Type**: Text
- **Required**: ✓

**Text field - subtitle:**
- **Name**: subtitle
- **Field ID**: subtitle
- **Type**: Text, Long text
- **Required**: ✓

**Text field - badge:**
- **Name**: badge
- **Field ID**: badge
- **Type**: Text
- **Default value**: Для Курьеров

**Text field - stat1_label:**
- **Name**: stat1_label
- **Field ID**: stat1_label
- **Type**: Text

**Text field - stat1_value:**
- **Name**: stat1_value
- **Field ID**: stat1_value
- **Type**: Text

**Text field - stat2_label:**
- **Name**: stat2_label
- **Field ID**: stat2_label
- **Type**: Text

**Text field - stat2_value:**
- **Name**: stat2_value
- **Field ID**: stat2_value
- **Type**: Text

**Text field - stat3_label:**
- **Name**: stat3_label
- **Field ID**: stat3_label
- **Type**: Text

**Text field - stat3_value:**
- **Name**: stat3_value
- **Field ID**: stat3_value
- **Type**: Text

**Text field - cta_text:**
- **Name**: cta_text
- **Field ID**: cta_text
- **Type**: Text

**Text field - cta_link:**
- **Name**: cta_link
- **Field ID**: cta_link
- **Type**: Text

**Text field - secondary_cta_text:**
- **Name**: secondary_cta_text
- **Field ID**: secondary_cta_text
- **Type**: Text

**Text field - secondary_cta_link:**
- **Name**: secondary_cta_link
- **Field ID**: secondary_cta_link
- **Type**: Text

5. Нажмите **"Save"**

### 2. Создайте Content Model "Tariff"

1. Нажмите **"Add content type"**
2. Название: **Tariff**
3. Краткое описание: **Тарифные планы**
4. Добавьте поля:

**Text field - name:**
- **Name**: name
- **Field ID**: name
- **Type**: Text
- **Required**: ✓

**Text field - subtitle:**
- **Name**: subtitle
- **Field ID**: subtitle
- **Type**: Text

**Number field - price:**
- **Name**: price
- **Field ID**: price
- **Type**: Number, Integer
- **Required**: ✓

**Text field - period:**
- **Name**: period
- **Field ID**: period
- **Type**: Text
- **Default value**: в неделю

**Boolean field - popular:**
- **Name**: popular
- **Field ID**: popular
- **Type**: Boolean
- **Default value**: false

**Number field - order:**
- **Name**: order
- **Field ID**: order
- **Type**: Number, Integer
- **Default value**: 0

**Text field - features:**
- **Name**: features
- **Field ID**: features
- **Type**: Text, Long text
- **Help text**: Введите каждое преимущество с новой строки

5. Нажмите **"Save"**

### 3. Создайте Content Model "Review"

1. Нажмите **"Add content type"**
2. Название: **Review**
3. Краткое описание: **Отзывы курьеров**
4. Добавьте поля:

**Text field - author:**
- **Name**: author
- **Field ID**: author
- **Type**: Text
- **Required**: ✓

**Text field - platform:**
- **Name**: platform
- **Field ID**: platform
- **Type**: Text

**Text field - duration:**
- **Name**: duration
- **Field ID**: duration
- **Type**: Text

**Number field - rating:**
- **Name**: rating
- **Field ID**: rating
- **Type**: Number, Integer
- **Validations**: Min: 1, Max: 5
- **Required**: ✓

**Text field - text:**
- **Name**: text
- **Field ID**: text
- **Type**: Text, Long text
- **Required**: ✓

**Number field - order:**
- **Name**: order
- **Field ID**: order
- **Type**: Number, Integer
- **Default value**: 0

5. Нажмите **"Save"**

### 4. Создайте Content Model "Faq"

1. Нажмите **"Add content type"**
2. Название: **Faq**
3. Краткое описание: **Вопросы и ответы**
4. Добавьте поля:

**Text field - question:**
- **Name**: question
- **Field ID**: question
- **Type**: Text
- **Required**: ✓

**Text field - answer:**
- **Name**: answer
- **Field ID**: answer
- **Type**: Text, Long text
- **Required**: ✓

**Number field - order:**
- **Name**: order
- **Field ID**: order
- **Type**: Number, Integer
- **Default value**: 0

5. Нажмите **"Save"**

### 5. Создайте Content Model "Bike"

1. Нажмите **"Add content type"**
2. Название: **Bike**
3. Краткое описание: **Каталог велосипедов**
4. Добавьте поля:

**Text field - name:**
- **Name**: name
- **Field ID**: name
- **Type**: Text
- **Required**: ✓

**Text field - description:**
- **Name**: description
- **Field ID**: description
- **Type**: Text, Long text

**Number field - price:**
- **Name**: price
- **Field ID**: price
- **Type**: Number, Integer
- **Required**: ✓

**Text field - range:**
- **Name**: range
- **Field ID**: range
- **Type**: Text

**Text field - speed:**
- **Name**: speed
- **Field ID**: speed
- **Type**: Text

**Text field - power:**
- **Name**: power
- **Field ID**: power
- **Type**: Text

**Media field - image:**
- **Name**: image
- **Field ID**: image
- **Type**: Media
- **Validations**: Accept file types: Images only

**Boolean field - available:**
- **Name**: available
- **Field ID**: available
- **Type**: Boolean
- **Default value**: true

**Number field - order:**
- **Name**: order
- **Field ID**: order
- **Type**: Number, Integer
- **Default value**: 0

5. Нажмите **"Save"**

## 📝 Шаг 5: Создание контента

Перейдите в **Content** в левом меню:

### Hero секция:
1. Нажмите **"Add entry"** в разделе **Hero**
2. Заполните поля (как в инструкции для Sanity)
3. Нажмите **"Publish"**

### Тарифы:
Создайте 3 записи в разделе **Tariff**

### Отзывы:
Создайте записи в разделе **Review**

### FAQ:
Создайте записи в разделе **Faq**

### Велосипеды:
Создайте записи в разделе **Bike**

## 🔓 Шаг 6: Настройка прав доступа

1. Перейдите в **Settings** → **API keys**
2. Выберите созданный API key
3. Убедитесь, что он имеет доступ ко всем Content Types
4. Установите **CORS origins**: `http://localhost:3000`

## 🔗 Шаг 7: Подключение к Next.js

После создания контента сообщите мне:
1. **Space ID**
2. **Content Delivery API - access token**

Я создам компоненты для интеграции Contentful с вашим Next.js сайтом.

## 🎯 Преимущества Contentful Free:

✅ **Бесплатный тариф**: 5 пользователей, 25,000 записей, 2GB хранилища  
✅ **Надежная инфраструктура**: 99.9% uptime, CDN по всему миру  
✅ **Мощный API**: RESTful API, богатые возможности фильтрации  
✅ **Простой интерфейс**: интуитивный веб-редактор  
✅ **Многоязычность**: встроенная поддержка локализации  
✅ **Webhooks**: автоматические уведомления об изменениях  
✅ **Preview API**: просмотр изменений перед публикацией