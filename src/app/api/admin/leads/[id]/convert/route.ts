import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRent } from '@/lib/rent';
import { upsertContactByPhone } from '@/lib/contact';

// POST - Превращение заявки в аренду: создаёт курьера (если новый), аренду и закрывает заявку
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = Number(params.id);
    const body = await request.json().catch(() => ({}));
    const bikeId = body.bikeId ? Number(body.bikeId) : null;

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    if (lead.rentId) {
      return NextResponse.json(
        { error: 'По этой заявке уже оформлена аренда' },
        { status: 409 }
      );
    }

    const targetBikeId = bikeId ?? lead.bikeId;

    if (!targetBikeId) {
      return NextResponse.json(
        { error: 'Выберите велосипед для оформления аренды' },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { phone: lead.phone },
      update: { name: lead.name },
      create: { phone: lead.phone, name: lead.name },
    });

    const startDate = body.startDate ? new Date(body.startDate) : (lead.startDate ? new Date(lead.startDate) : undefined);
    const endDate = body.endDate ? new Date(body.endDate) : (lead.endDate ? new Date(lead.endDate) : undefined);

    const rent = await createRent({
      userId: user.id,
      bikeId: targetBikeId,
      startDate,
      endDate,
      totalPrice: lead.totalPrice !== null && lead.totalPrice !== undefined ? Number(lead.totalPrice) : undefined,
    });

    await upsertContactByPhone({
      fullName: lead.name,
      phone: lead.phone,
      status: 'CUSTOMER',
      source: 'ADMIN',
    });

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'CONFIRMED',
        processedAt: new Date(),
        rentId: rent.id,
        bikeId: targetBikeId,
      },
      include: { bike: true },
    });

    return NextResponse.json({ lead: updatedLead, rentId: rent.id }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Не удалось оформить аренду по заявке';
    console.error('Ошибка при конвертации заявки в аренду:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
