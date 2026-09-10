import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const status = searchParams.get('status')?.trim();

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (q) {
      const filters = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { phone: { contains: q } },
      ];

      if (where.status) {
        where.AND = [
          { status: where.status },
          { OR: filters },
        ];
        delete where.status;
      } else {
        where.OR = filters;
      }
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { lastContactAt: 'desc' },
      take: 200,
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Ошибка при получении контактов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении контактов' },
      { status: 500 }
    );
  }
}
