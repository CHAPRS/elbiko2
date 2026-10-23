import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function splitDate(d: Date) {
  return { day: String(d.getDate()), month: MONTHS[d.getMonth()], year: String(d.getFullYear()) };
}

// GET /api/admin/documents/prefill?rentId=N | batteryRentId=N
// Данные для автозаполнения бланков: клиент, предмет, даты, номера документов
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rentId = searchParams.get('rentId');
    const batteryRentId = searchParams.get('batteryRentId');

    if (!rentId && !batteryRentId) {
      return NextResponse.json(
        { error: 'Укажите rentId или batteryRentId' },
        { status: 400 }
      );
    }

    const isBike = Boolean(rentId);
    const id = Number(rentId ?? batteryRentId);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Некорректный ID' }, { status: 400 });
    }

    const rent = isBike
      ? await prisma.rent.findUnique({
          where: { id },
          include: { user: true, bike: true },
        })
      : await prisma.batteryRent.findUnique({
          where: { id },
          include: { user: true, battery: true },
        });

    if (!rent) {
      return NextResponse.json({ error: 'Аренда не найдена' }, { status: 404 });
    }

    const item = isBike ? (rent as any).bike : (rent as any).battery;

    // Число оформленных продлений — для нумерации ДС
    const extendCount = isBike
      ? await prisma.rentTransaction.count({
          where: { rentId: id, type: 'EXTEND' },
        })
      : await prisma.batteryRentTransaction.count({
          where: { batteryRentId: id, type: 'EXTEND' },
        });

    const docsCount = await prisma.rentDocument.groupBy({
      by: ['kind'],
      where: isBike ? { rentId: id } : { batteryRentId: id },
      _count: true,
    });
    const counts: Record<string, number> = {};
    for (const c of docsCount) counts[c.kind] = c._count;

    return NextResponse.json({
      itemType: isBike ? 'bike' : 'battery',
      rent: {
        id: rent.id,
        status: rent.status,
        startDate: rent.startDate,
        endDate: rent.endDate,
        actualReturnDate: rent.actualReturnDate,
        totalPrice: Number(rent.totalPrice),
        createdAt: rent.createdAt,
      },
      user: {
        id: rent.user.id,
        name: rent.user.name,
        phone: rent.user.phone,
        passport: rent.user.passport,
        passportIssued: rent.user.passportIssued,
        birthDate: rent.user.birthDate,
        address: rent.user.address,
      },
      item: {
        name: item?.name ?? '',
        externalId: isBike ? (item as any).externalId : (item as any).serialNumber,
        serialNumber: isBike ? null : (item as any).serialNumber,
        mileage: isBike ? (item as any).mileage : null,
        voltage: isBike ? null : (item as any).voltage,
        capacityAh: isBike ? null : (item as any).capacityAh ? Number((item as any).capacityAh) : null,
        pricePerDay: Number(item?.pricePerDay ?? 0),
      },
      numbers: {
        contract: id,
        extension: Math.max(extendCount, counts['EXTENSION'] ?? 0) + 1,
      },
      docsCount: counts,
      // Хелпер для клиента — разбивка дат на день/месяц-прописью
      dates: {
        today: splitDate(new Date()),
        start: splitDate(new Date(rent.startDate)),
        end: splitDate(new Date(rent.endDate)),
        created: splitDate(new Date(rent.createdAt)),
      },
    });
  } catch (error) {
    console.error('Ошибка prefill документов:', error);
    return NextResponse.json({ error: 'Ошибка загрузки данных' }, { status: 500 });
  }
}
