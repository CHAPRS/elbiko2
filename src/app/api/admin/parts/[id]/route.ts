import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Редактирование номенклатуры
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { name, sku, category, unit, minQty, lastPrice, comment } = body;

    const part = await prisma.part.findUnique({ where: { id } });
    if (!part) {
      return NextResponse.json({ error: 'Позиция не найдена' }, { status: 404 });
    }

    const data: any = {};
    if (name !== undefined) {
      if (!String(name).trim()) {
        return NextResponse.json(
          { error: 'Название не может быть пустым' },
          { status: 400 }
        );
      }
      data.name = String(name).trim();
    }
    if (sku !== undefined) data.sku = sku ? String(sku).trim() : null;
    if (category !== undefined) data.category = category ? String(category).trim() : null;
    if (unit !== undefined) data.unit = unit ? String(unit).trim() : 'шт';
    if (comment !== undefined) data.comment = comment ? String(comment).trim() : null;

    if (minQty !== undefined) {
      if (minQty === null || minQty === '') {
        data.minQty = null;
      } else {
        const v = Number(minQty);
        if (!Number.isFinite(v) || v < 0) {
          return NextResponse.json(
            { error: 'Некорректный минимальный остаток' },
            { status: 400 }
          );
        }
        data.minQty = v;
      }
    }
    if (lastPrice !== undefined) {
      if (lastPrice === null || lastPrice === '') {
        data.lastPrice = null;
      } else {
        const v = Number(lastPrice);
        if (!Number.isFinite(v) || v < 0) {
          return NextResponse.json(
            { error: 'Некорректная цена' },
            { status: 400 }
          );
        }
        data.lastPrice = v;
      }
    }

    const updated = await prisma.part.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Ошибка PATCH /api/admin/parts/[id]:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить позицию' },
      { status: 500 }
    );
  }
}

// DELETE - Удаление номенклатуры (вместе с историей движений)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    await prisma.part.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка DELETE /api/admin/parts/[id]:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить позицию' },
      { status: 500 }
    );
  }
}
