import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Статические данные велосипедов для каталога
const staticBikes = [
  {
    id: 1,
    name: 'Wenbox U6',
    description: 'Идеален для курьерской доставки',
    price: 3000,
    period: 'в неделю',
    imageUrl: '/images/wenbox-u6.png',
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Wenbox U6 Pro',
    description: 'Максимальная комплектация для длинных смен',
    price: 3500,
    period: 'в неделю',
    imageUrl: '/images/wenbox-u6.png',
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Публичный каталог: отдаем статические данные
export async function GET() {
  try {
    return NextResponse.json(staticBikes);
  } catch (error) {
    console.error('Ошибка при получении каталога:', error);
    return NextResponse.json({ error: 'Не удалось загрузить каталог' }, { status: 500 });
  }
}
