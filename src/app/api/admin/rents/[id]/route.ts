import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Обновление аренды (завершение, продление, изменение статуса, оплата)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { status, endDate, extendDays, paymentStatus, paymentMethod } = body;

    const rent = await prisma.rent.findUnique({
      where: { id },
      include: { bike: true, payment: true },
    });

    if (!rent) {
      return NextResponse.json(
        { error: 'Аренда не найдена' },
        { status: 404 }
      );
    }

    const updatedRent = await prisma.$transaction(async (tx) => {
      let updateData: any = {};

      // Обновление статуса
      if (status) {
        updateData.status = status;

        if (status === 'RETURNED') {
          updateData.isActive = false;
          updateData.actualReturnDate = new Date();
          if (rent.bike.status !== 'FREE') {
            await tx.bike.update({
              where: { id: rent.bikeId },
              data: { status: 'FREE' },
            });
          }
        }

        if (status === 'COMPLETED' || status === 'CANCELLED') {
          updateData.isActive = false;
          if (rent.bike.status !== 'FREE') {
            await tx.bike.update({
              where: { id: rent.bikeId },
              data: { status: 'FREE' },
            });
          }
        }

        if (status === 'OVERDUE') {
          updateData.isActive = false;
        }
      }

      // Продление аренды
      if (extendDays && extendDays > 0) {
        const currentEndDate = new Date(rent.endDate);
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() + extendDays);

        const bike = await tx.bike.findUnique({
          where: { id: rent.bikeId },
        });

        const additionalPrice = bike ? Number(bike.pricePerDay) * extendDays : 0;
        const newTotal = Number(rent.totalPrice) + additionalPrice;

        updateData.endDate = newEndDate;
        updateData.totalPrice = newTotal;

        if (additionalPrice > 0) {
          await tx.rentTransaction.create({
            data: {
              rentId: id,
              type: 'EXTEND',
              amount: additionalPrice,
              comment: `Продление на ${extendDays} дн.`,
            },
          });

          if (rent.payment && rent.payment.status === 'PENDING') {
            await tx.payment.update({
              where: { id: rent.payment.id },
              data: { amount: newTotal },
            });
          }
        }
      }

      // Обновление даты окончания
      if (endDate) {
        updateData.endDate = new Date(endDate);
      }

      const updated = await tx.rent.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          bike: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          payment: true,
        },
      });

      // Обновление статуса платежа
      if (paymentStatus && updated.payment) {
        const paidAt = paymentStatus === 'COMPLETED' ? new Date() : null;

        await tx.payment.update({
          where: { id: updated.payment.id },
          data: {
            status: paymentStatus,
            paymentMethod,
            paidAt,
          },
        });

        if (paymentStatus === 'COMPLETED') {
          await tx.rentTransaction.create({
            data: {
              rentId: id,
              type: 'PAYMENT',
              amount: updated.payment.amount,
              method: paymentMethod,
              comment: paymentMethod ? `Оплата: ${paymentMethod}` : null,
            },
          });
        } else if (paymentStatus === 'REFUNDED') {
          await tx.rentTransaction.create({
            data: {
              rentId: id,
              type: 'REFUND',
              amount: updated.payment.amount,
              method: paymentMethod,
              comment: paymentMethod ? `Возврат: ${paymentMethod}` : null,
            },
          });
        }
      }

      return updated;
    });

    return NextResponse.json(updatedRent);
  } catch (error) {
    console.error('Ошибка при обновлении аренды:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении аренды' },
      { status: 500 }
    );
  }
}

// DELETE - Удаление аренды (с освобождением велосипеда)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    const rent = await prisma.rent.findUnique({
      where: { id },
    });

    if (rent) {
      // Освобождаем велосипед
      await prisma.bike.update({
        where: { id: rent.bikeId },
        data: { status: 'FREE' },
      });
    }

    await prisma.rent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении аренды:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении аренды' },
      { status: 500 }
    );
  }
}
