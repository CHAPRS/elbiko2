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

  // Преимущества (Bento Grid)
  const features = [
    {
      icon: '🚴',
      title: 'Готов к работе',
      description: 'Получите электровелосипед и начинайте зарабатывать больше без необходимости покупать и обслуживать собственный транспорт.',
      imageUrl: '/images/hero-bike-main.png',
      order: 1,
      isMain: true,
      badges: JSON.stringify(['Для работы курьером', 'В аренду', 'Готовый транспорт'])
    },
    {
      icon: '⚡',
      title: 'Экономично',
      description: 'Арендуйте велосипед когда нужно для работы, вместо покупки собственного транспорта.',
      order: 2,
      isMain: false,
      badges: null
    },
    {
      icon: '�',
      title: 'Сервис',
      description: 'Возникла техническая проблема — обратитесь к нам, и мы поможем решить вопрос.',
      order: 3,
      isMain: false,
      badges: null
    },
    {
      icon: '�',
      title: 'Запас энергии на всю смену',
      description: 'Меньше отвлечений на транспорт — больше времени для работы.',
      order: 4,
      isMain: false,
      badges: null
    },
    {
      icon: '�',
      title: 'Мы рядом',
      description: 'Поможем разобраться с арендой, велосипедом и эксплуатацией.',
      order: 5,
      isMain: false,
      badges: null
    }
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
      badges: null,
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
