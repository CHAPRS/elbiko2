import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const VALID_KINDS = ['CONTRACT', 'HANDOVER_ACT', 'RETURN_ACT', 'EXTENSION'];

// GET /api/admin/documents?rentId=N | batteryRentId=N — список документов по аренде
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rentId = searchParams.get('rentId');
    const batteryRentId = searchParams.get('batteryRentId');

    const where: any = {};
    if (rentId) where.rentId = Number(rentId);
    else if (batteryRentId) where.batteryRentId = Number(batteryRentId);
    else {
      return NextResponse.json(
        { error: 'Укажите rentId или batteryRentId' },
        { status: 400 }
      );
    }

    const docs = await prisma.rentDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        kind: true,
        title: true,
        createdAt: true,
      },
    });

    return NextResponse.json(docs);
  } catch (error) {
    console.error('Ошибка списка документов:', error);
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 });
  }
}

// POST /api/admin/documents — сохранить заполненный бланк (снапшот HTML + поля)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kind, title, html, fields, rentId, batteryRentId, userFields } = body;

    if (!VALID_KINDS.includes(kind)) {
      return NextResponse.json({ error: 'Некорректный тип документа' }, { status: 400 });
    }
    if (!title || !html) {
      return NextResponse.json({ error: 'Укажите название и содержимое' }, { status: 400 });
    }
    if (!rentId && !batteryRentId) {
      return NextResponse.json({ error: 'Укажите аренду' }, { status: 400 });
    }

    const doc = await prisma.rentDocument.create({
      data: {
        kind,
        title: String(title),
        html: String(html),
        fields: fields ?? undefined,
        rentId: rentId ? Number(rentId) : null,
        batteryRentId: batteryRentId ? Number(batteryRentId) : null,
      },
    });

    // Паспортные данные клиента — сохраняем в карточку для следующих документов
    if (userFields && typeof userFields === 'object') {
      const userId = Number(userFields.userId);
      if (Number.isInteger(userId)) {
        const data: Record<string, string | null> = {};
        for (const key of ['passport', 'passportIssued', 'birthDate', 'address']) {
          if (key in userFields) {
            const v = userFields[key];
            data[key] = v === null || v === '' ? null : String(v);
          }
        }
        if (Object.keys(data).length > 0) {
          await prisma.user.update({ where: { id: userId }, data });
        }
      }
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error('Ошибка сохранения документа:', error);
    return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 });
  }
}
