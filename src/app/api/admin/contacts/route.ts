import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function hasLetters(value: string): boolean {
  return /[a-zA-Zа-яА-ЯёЁ]/.test(value);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const status = searchParams.get('status')?.trim();
    const phone = searchParams.get('phone')?.trim();

    const query = phone || q || '';
    const digits = onlyDigits(query);
    const isNameQuery = q ? hasLetters(q) : false;

    const statusCondition = status
      ? Prisma.sql`AND status = ${status}`
      : Prisma.sql``;

    let contacts: any[] = [];

    if (phone && digits.length >= 4) {
      // Точный поиск по телефону (любой формат записи)
      const phonePattern = `%${digits}%`;
      contacts = await prisma.$queryRaw`
        SELECT * FROM Contact
        WHERE REGEXP_REPLACE(phone, '[^0-9]', '') LIKE ${phonePattern}
        ${statusCondition}
        ORDER BY lastContactAt DESC
        LIMIT 200
      `;
    } else if (q && digits.length >= 4 && !isNameQuery) {
      // Поиск по телефону из общего запроса
      const phonePattern = `%${digits}%`;
      contacts = await prisma.$queryRaw`
        SELECT * FROM Contact
        WHERE REGEXP_REPLACE(phone, '[^0-9]', '') LIKE ${phonePattern}
        ${statusCondition}
        ORDER BY lastContactAt DESC
        LIMIT 200
      `;
    } else if (q) {
      // Поиск по фамилии/имени
      const namePattern = `%${q}%`;
      contacts = await prisma.$queryRaw`
        SELECT * FROM Contact
        WHERE firstName LIKE ${namePattern} OR lastName LIKE ${namePattern}
        ${statusCondition}
        ORDER BY lastContactAt DESC
        LIMIT 200
      `;
    } else {
      // Без поиска — все контакты с фильтром по статусу
      contacts = await prisma.$queryRaw`
        SELECT * FROM Contact
        WHERE 1=1
        ${statusCondition}
        ORDER BY lastContactAt DESC
        LIMIT 200
      `;
    }

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Ошибка при получении контактов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении контактов' },
      { status: 500 }
    );
  }
}
