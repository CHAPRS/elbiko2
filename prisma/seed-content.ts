import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Начинаем заполнение контента...')

  // Hero секция
  const hero = await prisma.hero.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Электровелосипед для работы курьером',
      subtitle: 'Надёжные электровелосипеды в аренду для курьеров. Быстрое оформление, готовый к работе велосипед и сервис на весь срок аренды.',
      badge: 'Для Курьеров',
      backgroundImageUrl: '/images/delivery.jpg',
      bikeImageUrl: '/images/hero-bike-main.png',
      courierImageUrl: '/images/delivery.jpg',
      phone: '+7 (987) 847-92-89',
      telegramUrl: 'https://t.me/your_telegram',
      maksUrl: 'https://maks.com/your_profile',
      price: 'от 3000 ₽/неделя',
      stat1Label: '⚡',
      stat1Value: 'от 3000 ₽/неделя',
      stat2Label: '📄',
      stat2Value: 'Оформление за 5 минут',
      stat3Label: '🔧',
      stat3Value: 'Поможем с ремонтом',
      ctaText: 'Выбрать велосипед',
      ctaLink: '#catalog',
      secondaryCtaText: 'Как это работает',
      secondaryCtaLink: '#how-it-works',
      isActive: true,
    },
  })
  console.log('Hero создан:', hero.title)

  // Преимущества
  const features = [
    {
      icon: '⚡',
      title: 'Мощные АКБ',
      description: '2 аккумулятора от 30 до 45 Ah — меняй и не останавливай смену. Зарядные станции в комплекте.',
      imageUrl: '/images/feature-battery.jpg',
      order: 1,
    },
    {
      icon: '🔧',
      title: 'Надёжная техника',
      description: 'Все велосипеды проходят техосмотр перед выдачей. Работает в любую погоду — доставки не останавливаются.',
      imageUrl: '/images/feature-reliable.jpg',
      order: 2,
    },
    {
      icon: '📝',
      title: 'Гибкий договор',
      description: 'Аренда от одной недели. Продли или верни велосипед в любое время — без штрафов и лишних вопросов.',
      imageUrl: '/images/feature-contract.jpg',
      order: 3,
    },
    {
      icon: '💬',
      title: 'Поддержка по связи',
      description: 'Вопросы по аренде и технике — отвечаем в мессенджерах и по телефону в рабочее время.',
      imageUrl: '/images/feature-support.jpg',
      order: 4,
    },
    {
      icon: '🚀',
      title: 'Премиум для долгих смен',
      description: 'Эргономичное седло, отличный свет и все необходимы световые индикаторы, амортизаторы и бортовой дисплей.',
      imageUrl: '/images/feature-premium.jpg',
      order: 5,
    },
    {
      icon: '📍',
      title: 'Одна точка в Оренбурге',
      description: 'Выдача, возврат и технические вопросы — всё по одному адресу: г. Оренбург, ул. Салмышская, д30. Удобно и без лишних поездок.',
      imageUrl: '/images/feature-location.jpg',
      order: 6,
    },
  ]

  for (const feature of features) {
    await prisma.feature.upsert({
      where: { id: feature.order },
      update: {},
      create: feature,
    })
  }
  console.log('Преимущества созданы:', features.length)

  // Шаги
  const steps = [
    {
      number: '01',
      title: 'Оставьте заявку',
      description: 'Заполните короткую форму на сайте и укажите удобный способ связи.',
      imageUrl: '/images/Иллюстрация 1 Выберите велосипед.jpg',
      icon: '📱',
      badges: null,
      order: 1,
    },
    {
      number: '02',
      title: 'Мы свяжемся с вами',
      description: 'Уточним детали аренды, ответим на вопросы и поможем выбрать подходящий вариант.',
      imageUrl: '/images/Иллюстрация 2 Оформите аренду.jpg',
      icon: '📞',
      badges: null,
      order: 2,
    },
    {
      number: '03',
      title: 'Заберите готовый электровелосипед',
      description: 'Получите проверенный, заряженный и готовый к работе велосипед.',
      imageUrl: '/images/Иллюстрация 3 Получите велосипед.jpg',
      icon: '🚴',
      badges: JSON.stringify(['Проверен', 'Заряжен', 'Готов к работе']),
      order: 3,
    },
    {
      number: '04',
      title: 'Выходите на линию',
      description: 'Получите электровелосипед и можете начинать работать.',
      imageUrl: '/images/Иллюстрация 4.jpg',
      icon: '🚀',
      badges: null,
      order: 4,
    },
  ]

  for (const step of steps) {
    await prisma.step.upsert({
      where: { id: step.order },
      update: {},
      create: step,
    })
  }
  console.log('Шаги созданы:', steps.length)

  // Тарифы
  const tariffs = [
    {
      name: 'Базовый',
      subtitle: '2 АКБ × 30 Ah · стандартные смены',
      price: 3000,
      period: 'в неделю',
      features: JSON.stringify([
        '2 аккумулятора по 30 Ah',
        'Корзина и замок в комплекте',
        'Техосмотр перед выдачей',
        'Гибкий договор'
      ]),
      popular: false,
      imageUrl: '/images/tariff-basic.jpg',
      order: 1,
    },
    {
      name: 'Заработок',
      subtitle: '2 АКБ: 30 Ah и 45 Ah · увеличенный пробег',
      price: 3500,
      period: 'в неделю',
      features: JSON.stringify([
        '2 аккумулятора увеличенной емкости',
        'Корзина, замок, крылья',
        'Техосмотр перед выдачей',
        'Гибкий договор',
        'Бесплатное ТО каждые 14 дней',
        'Подходит для полных рабочих дней'
      ]),
      popular: true,
      imageUrl: '/images/tariff-earning.jpg',
      order: 2,
    },
    {
      name: 'Партнер',
      subtitle: '2 АКБ × 45 Ah · для длинных смен',
      price: 15000,
      period: 'в месяц',
      features: JSON.stringify([
        'все из тарифа "Заработок"',
        '2 аккумулятора максимальной емкости',
        'подменный, новый аналогичный электровелосипед на время ТО',
      ]),
      popular: false,
      imageUrl: '/images/tariff-partner.jpg',
      order: 3,
    },
  ]

  for (const tariff of tariffs) {
    await prisma.tariff.upsert({
      where: { id: tariff.order },
      update: {},
      create: tariff,
    })
  }
  console.log('Тарифы созданы:', tariffs.length)

  console.log('Контент успешно добавлен!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
