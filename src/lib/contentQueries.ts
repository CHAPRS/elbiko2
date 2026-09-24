import { prisma } from './prisma'

// Получение Hero секции
export async function getHeroFromDB() {
  try {
    const hero = await prisma.hero.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
    return hero
  } catch (error) {
    console.error('Error fetching hero from DB:', error)
    return null
  }
}

// Получение Преимуществ
export async function getFeaturesFromDB() {
  try {
    const features = await prisma.feature.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
    return features
  } catch (error) {
    console.error('Error fetching features from DB:', error)
    return []
  }
}

// Получение Шагов
export async function getStepsFromDB() {
  try {
    const steps = await prisma.step.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
    return steps
  } catch (error) {
    console.error('Error fetching steps from DB:', error)
    return []
  }
}

// Получение Тарифов
export async function getTariffsFromDB() {
  try {
    const tariffs = await prisma.tariff.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
    return tariffs.map(tariff => ({
      ...tariff,
      features: tariff.features ? JSON.parse(tariff.features) : []
    }))
  } catch (error) {
    console.error('Error fetching tariffs from DB:', error)
    return []
  }
}

// Получение Отзывов
export async function getReviewsFromDB() {
  try {
    const reviews = await prisma.review.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
    return reviews
  } catch (error) {
    console.error('Error fetching reviews from DB:', error)
    return []
  }
}

// Получение FAQ
export async function getFAQFromDB() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
    return faqs
  } catch (error) {
    console.error('Error fetching FAQ from DB:', error)
    return []
  }
}
