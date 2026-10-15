import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Редактирование аккумулятора
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { name, serialNumber, capacityAh, voltage, status, pricePerDay, purchasePrice, purchaseDate, comment } = body;

    const battery = await prisma.battery.findUnique({
      where: { id },
      include: { rents: { where: { isActive: true }, take: 1 } },
    });

    if (!battery) {
      return NextResponse.json({ error: 'Аккумулятор не найден' }, { status: 404 });
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

    if (serialNumber !== undefined) data.serialNumber = serialNumber ? String(serialNumber).trim() : null;
    if (comment !== undefined) data.comment = comment ? String(comment).trim() : null;
    if (purchaseDate !== undefined) data.purchaseDate = purchaseDate ? new Date(purchaseDate) : null;

    const numFields: [string, unknown][] = [
      ['capacityAh', capacityAh],
      ['voltage', voltage],
      ['pricePerDay', pricePerDay],
      ['purchasePrice', purchasePrice],
    ];
    for (const [field, raw] of numFields) {
      if (raw === undefined) continue;
      if (raw === null || raw === '') {
        data[field] = field === 'pricePerDay' ? 0 : null;
        continue;
      }
      const v = Number(raw);
      if (!Number.isFinite(v) || v < 0) {
        return NextResponse.json(
          { error: `Некорректное значение поля ${field}` },
          { status: 400 }
        );
      }
      data[field] = field === 'voltage' ? Math.round(v) : v;
    }

    if (status !== undefined) {
      const allowed = ['FREE', 'MAINTENANCE', 'BLOCKED'];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          { error: 'Статус RENTED устанавливается автоматически при оформлении аренды' },
          { status: 400 }
        );
      }
      if (status !== 'RENTED' && battery.rents.length > 0) {
        return NextResponse.json(
          { error: 'У аккумулятора есть активная аренда — сначала завершите её' },
          { status: 409 }
        );
      }
      data.status = status;
    }

    const updated = await prisma.battery.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Ошибка PATCH /api/admin/batteries/[id]:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить аккумулятор' },
      { status: 500 }
    );
  }
}

// DELETE - Удаление аккумулятора (только без активной аренды)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    const activeRent = await prisma.batteryRent.findFirst({
      where: { batteryId: id, isActive: true },
    });

    if (activeRent) {
      return NextResponse.json(
        { error: 'Нельзя удалить: у аккумулятора есть активная аренда' },
        { status: 409 }
      );
    }

    await prisma.battery.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка DELETE /api/admin/batteries/[id]:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить аккумулятор' },
      { status: 500 }
    );
  }
}
