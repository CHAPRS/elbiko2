import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - История движений по позиции
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const transactions = await prisma.partTransaction.findMany({
      where: { partId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        bike: { select: { id: true, name: true, externalId: true } },
      },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Ошибка GET /api/admin/parts/[id]/transactions:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить историю' },
      { status: 500 }
    );
  }
}

// POST - Движение по складу: IN (приход), OUT (списание/установка), ADJUST (корректировка)
// kind=IN:    qty>0, price — цена закупки за ед. Расходом НЕ считается (запас — актив).
// kind=OUT:   qty>0, <= остатка; создаёт MiscTransaction EXPENSE (категория PARTS) на байк.
// kind=ADJUST: qty — дельта со знаком (+/-), итоговый остаток не может быть < 0.
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { kind, qty, price, bikeId, comment } = body;

    if (!['IN', 'OUT', 'ADJUST'].includes(kind)) {
      return NextResponse.json(
        { error: 'Некорректный тип операции' },
        { status: 400 }
      );
    }

    const part = await prisma.part.findUnique({ where: { id } });
    if (!part) {
      return NextResponse.json({ error: 'Позиция не найдена' }, { status: 404 });
    }

    const qtyNum = Number(qty);
    if (!Number.isFinite(qtyNum) || qtyNum === 0) {
      return NextResponse.json(
        { error: 'Укажите количество' },
        { status: 400 }
      );
    }
    if ((kind === 'IN' || kind === 'OUT') && qtyNum <= 0) {
      return NextResponse.json(
        { error: 'Количество должно быть больше нуля' },
        { status: 400 }
      );
    }

    let priceNum: number | null = null;
    if (price !== undefined && price !== null && price !== '') {
      const v = Number(price);
      if (!Number.isFinite(v) || v < 0) {
        return NextResponse.json(
          { error: 'Некорректная цена' },
          { status: 400 }
        );
      }
      priceNum = Math.round(v * 100) / 100;
    }

    const currentStock = Number(part.stockQty);
    let newStock: number;
    let bikeIdNum: number | null = null;

    if (kind === 'IN') {
      newStock = currentStock + qtyNum;
    } else if (kind === 'OUT') {
      if (qtyNum > currentStock + 0.0001) {
        return NextResponse.json(
          { error: `Недостаточно на складе: доступно ${currentStock} ${part.unit}` },
          { status: 400 }
        );
      }
      newStock = Math.round((currentStock - qtyNum) * 100) / 100;

      if (bikeId !== undefined && bikeId !== null && bikeId !== '') {
        bikeIdNum = Number(bikeId);
        const bike = await prisma.bike.findUnique({ where: { id: bikeIdNum } });
        if (!bike) {
          return NextResponse.json({ error: 'Байк не найден' }, { status: 400 });
        }
      }
    } else {
      // ADJUST: qty — дельта со знаком
      newStock = Math.round((currentStock + qtyNum) * 100) / 100;
      if (newStock < 0) {
        return NextResponse.json(
          { error: 'Остаток не может быть отрицательным' },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      let miscTxId: number | null = null;

      // OUT → расход на байк по цене списания (вариант B: расход при установке)
      if (kind === 'OUT' && priceNum !== null && priceNum > 0) {
        const misc = await tx.miscTransaction.create({
          data: {
            kind: 'EXPENSE',
            title: `Запчасть: ${part.name}`,
            amount: Math.round(qtyNum * priceNum * 100) / 100,
            category: 'PARTS',
            bikeId: bikeIdNum,
            comment: comment ? String(comment).trim() : null,
          },
        });
        miscTxId = misc.id;
      }

      const partTx = await tx.partTransaction.create({
        data: {
          partId: id,
          kind,
          qty: qtyNum,
          price: priceNum,
          bikeId: bikeIdNum,
          miscTransactionId: miscTxId,
          comment: comment ? String(comment).trim() : null,
        },
      });

      const updatedPart = await tx.part.update({
        where: { id },
        data: {
          stockQty: newStock,
          // Цена последней закупки обновляется только приходом с ценой
          ...(kind === 'IN' && priceNum !== null ? { lastPrice: priceNum } : {}),
        },
      });

      return { partTx, updatedPart };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Ошибка POST /api/admin/parts/[id]/transactions:', error);
    return NextResponse.json(
      { error: 'Не удалось провести операцию' },
      { status: 500 }
    );
  }
}
