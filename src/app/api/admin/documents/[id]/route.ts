import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/documents/[id] — сохранённый документ
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const doc = await prisma.rentDocument.findUnique({
      where: { id },
      include: {
        rent: {
          select: {
            id: true,
            user: { select: { name: true } },
            bike: { select: { name: true, externalId: true } },
          },
        },
        batteryRent: {
          select: {
            id: true,
            user: { select: { name: true } },
            battery: { select: { name: true } },
          },
        },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Документ не найден' }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error('Ошибка загрузки документа:', error);
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 });
  }
}

// PATCH /api/admin/documents/[id] — пересохранить документ после редактирования полей
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { title, html, fields, userFields } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = String(title);
    if (html !== undefined) data.html = String(html);
    if (fields !== undefined) data.fields = fields;

    const doc = await prisma.rentDocument.update({ where: { id }, data });

    // Те же паспортные данные клиента — актуализируем
    if (userFields && typeof userFields === 'object') {
      const userId = Number(userFields.userId);
      if (Number.isInteger(userId)) {
        const udata: Record<string, string | null> = {};
        for (const key of ['passport', 'passportIssued', 'birthDate', 'address']) {
          if (key in userFields) {
            const v = userFields[key];
            udata[key] = v === null || v === '' ? null : String(v);
          }
        }
        if (Object.keys(udata).length > 0) {
          await prisma.user.update({ where: { id: userId }, data: udata });
        }
      }
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error('Ошибка обновления документа:', error);
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}

// DELETE /api/admin/documents/[id] — удалить документ
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    await prisma.rentDocument.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления документа:', error);
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
  }
}
