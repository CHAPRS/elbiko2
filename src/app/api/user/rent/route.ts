import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Явно описываем тип данных, который вернет наша транзакция
interface TransactionResult {
  updatedBike: any;
  rentalSession: any;
}

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
    const { bikeId } = body;

    if (!bikeId) {
      return NextResponse.json(
        { error: "Не указан ID велосипеда" },
        { status: 400 }
      );
    }

    // Явно указываем тип возвращаемого значения для стрелочной функции: : Promise<TransactionResult>
    const result: TransactionResult = await prisma.$transaction(async (tx): Promise<TransactionResult> => {
      // 1. Проверяем существование и статус велосипеда
      const bike = await tx.bike.findUnique({
        where: { id: Number(bikeId) },
      });

      if (!bike) {
        throw new Error("Велосипед не найден");
      }

      if (bike.status !== "FREE") {
        throw new Error("Этот велосипед уже арендован или находится на ТО");
      }

      // 2. Обновляем статус велосипеда на RENTED
      const updatedBike = await tx.bike.update({
        where: { id: Number(bikeId) },
        data: { status: "RENTED" },
      });

      // 3. Создаем новую сессию аренды для курьера
      const rentalSession = await tx.rentalSession.create({
        data: {
          bikeId: Number(bikeId),
          userId: courierId,
        } as any,
      });

      // Возвращаем строго типизированный объект
      return { updatedBike, rentalSession };
    });

    return NextResponse.json({
      success: true,
      message: "Аренда успешно оформлена",
      data: result,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
