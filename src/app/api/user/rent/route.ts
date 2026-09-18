import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRent } from "@/lib/rent";
import { upsertContactByPhone } from "@/lib/contact";
import { cookies } from "next/headers";

async function getCourierIdFromSession(): Promise<number | null> {
  const cookieStore = cookies();
  const session = cookieStore.get("courier_session");
  
  if (!session) return null;
  
  const userId = parseInt(session.value, 10);
  return isNaN(userId) ? null : userId;
}

export async function POST(request: Request) {
  try {
    const courierId = await getCourierIdFromSession();
    
    if (!courierId) {
      return NextResponse.json(
        { error: "Не авторизован или сессия истекла" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bikeId, days } = body;

    if (!bikeId) {
      return NextResponse.json(
        { error: "Не указан ID велосипеда" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: courierId } });

    if (!user) {
      return NextResponse.json(
        { error: "Курьер не найден" },
        { status: 404 }
      );
    }

    const rentDays = Number(days) > 0 ? Number(days) : 1;

    const startDate = body.startDate ? new Date(body.startDate) : new Date();
    const endDate = body.endDate ? new Date(body.endDate) : undefined;

    const rent = await createRent({
      userId: courierId,
      bikeId: Number(bikeId),
      days: endDate ? undefined : rentDays,
      startDate,
      endDate,
    });

    await upsertContactByPhone({
      fullName: user.name,
      phone: user.phone,
      status: 'CUSTOMER',
      source: 'RENT',
    });

    return NextResponse.json({
      success: true,
      message: "Аренда успешно оформлена",
      data: { rentId: rent.id, totalPrice: rent.totalPrice, endDate: rent.endDate },
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
