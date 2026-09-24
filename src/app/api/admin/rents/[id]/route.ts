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
    const {
      status,
      bikeId,
      startDate,
      endDate,
      totalPrice,
      comment,
      extendDays,
      extendBikeId,
      extendPrice,
      paymentStatus,
      paymentMethod,
    } = body;

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

    const updatedRentId = await prisma.$transaction(
      async (tx) => {
      let updateData: any = {};

      // Обновление статуса
      if (status) {
        updateData.status = status;

        const currentBike =
          rent.bike ?? (rent.bikeId ? await tx.bike.findUnique({ where: { id: rent.bikeId } }) : null);

        if (status === 'RETURNED') {
          updateData.isActive = false;
          updateData.actualReturnDate = new Date();
          if (currentBike && currentBike.status !== 'FREE') {
            await tx.bike.update({
              where: { id: currentBike.id },
              data: { status: 'FREE' },
            });
          }
        }

        if (status === 'COMPLETED' || status === 'CANCELLED') {
          updateData.isActive = false;
          if (currentBike && currentBike.status !== 'FREE') {
            await tx.bike.update({
              where: { id: currentBike.id },
              data: { status: 'FREE' },
            });
          }
        }

        if (status === 'OVERDUE') {
          updateData.isActive = false;
        }
      }

      // Продление аренды с возможностью замены байка и ручной стоимости
      if (extendDays && extendDays > 0) {
        if (['COMPLETED', 'CANCELLED', 'RETURNED'].includes(rent.status)) {
          throw new Error('Нельзя продлить завершённую или отменённую аренду');
        }

        const extensionDays = Number(extendDays);
        const targetBikeId = extendBikeId ? Number(extendBikeId) : rent.bikeId;
        const targetBike = await tx.bike.findUnique({ where: { id: targetBikeId } });

        if (!targetBike) {
          throw new Error('Выбранный велосипед не найден');
        }

        if (targetBikeId !== rent.bikeId && targetBike.status !== 'FREE') {
          throw new Error('Новый велосипед недоступен для замены');
        }

        let additionalPrice = 0;
        if (extendPrice !== undefined && extendPrice !== null && extendPrice !== '') {
          additionalPrice = Number(extendPrice);
        } else {
          additionalPrice = Number(targetBike.pricePerDay) * extensionDays;
        }

        if (additionalPrice < 0) {
          throw new Error('Стоимость продления не может быть отрицательной');
        }

        const currentEndDate = new Date(rent.endDate);
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() + extensionDays);

        updateData.endDate = newEndDate;
        updateData.totalPrice = Number(rent.totalPrice) + additionalPrice;

        // Замена велосипеда при продлении
        if (targetBikeId !== rent.bikeId) {
          await tx.bike.updateMany({ where: { id: rent.bikeId }, data: { status: 'FREE' } });
          await tx.bike.update({ where: { id: targetBikeId }, data: { status: 'RENTED' } });
          updateData.bikeId = targetBikeId;
        }

        // Если аренда была просрочена, а теперь endDate в будущем — возвращаем ACTIVE
        if (rent.status === 'OVERDUE' && newEndDate > new Date()) {
          updateData.status = 'ACTIVE';
          updateData.isActive = true;
        }

        await tx.rentTransaction.create({
          data: {
            rentId: id,
            type: 'EXTEND',
            amount: additionalPrice,
            comment: `Продление на ${extensionDays} дн.${
              targetBikeId !== rent.bikeId ? ` (замена на ${targetBike.name})` : ''
            }`,
          },
        });
      }

      // Ручная корректировка срока, стоимости и комментария
      if (startDate) {
        updateData.startDate = new Date(startDate);
      }
      if (endDate) {
        updateData.endDate = new Date(endDate);
      }
      if (totalPrice !== undefined && totalPrice !== null && totalPrice !== '') {
        updateData.totalPrice = Number(totalPrice);
      }
      if (comment !== undefined) {
        updateData.comment = comment.trim() || null;
      }

      // Замена велосипеда во время аренды
      const newBikeId = bikeId ? Number(bikeId) : null;
      if (newBikeId && newBikeId !== rent.bikeId) {
        const newBike = await tx.bike.findUnique({ where: { id: newBikeId } });
        if (!newBike) {
          throw new Error('Новый велосипед не найден');
        }
        if (newBike.status !== 'FREE') {
          throw new Error('Новый велосипед недоступен для замены');
        }

        await tx.bike.updateMany({ where: { id: rent.bikeId }, data: { status: 'FREE' } });
        await tx.bike.update({ where: { id: newBikeId }, data: { status: 'RENTED' } });

        updateData.bikeId = newBikeId;
      }

      // Актуальная сумма платежа после возможного обновления
      const updatedPaymentAmount =
        updateData.totalPrice !== undefined && rent.payment && rent.payment.status === 'PENDING'
          ? Number(updateData.totalPrice)
          : rent.payment
          ? Number(rent.payment.amount)
          : null;

      // Синхронизируем сумму ожидаемого платежа, если аренда ещё не оплачена
      if (updateData.totalPrice && rent.payment && rent.payment.status === 'PENDING') {
        await tx.payment.update({
          where: { id: rent.payment.id },
          data: { amount: updatedPaymentAmount as number },
        });
      }

      const updated = await tx.rent.update({
        where: { id },
        data: updateData,
      });

      // Обновление статуса платежа
      if (paymentStatus && rent.payment) {
        const paidAt = paymentStatus === 'COMPLETED' ? new Date() : null;

        await tx.payment.update({
          where: { id: rent.payment.id },
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
              amount: updatedPaymentAmount as number,
              method: paymentMethod,
              comment: paymentMethod ? `Оплата: ${paymentMethod}` : null,
            },
          });
        } else if (paymentStatus === 'REFUNDED') {
          await tx.rentTransaction.create({
            data: {
              rentId: id,
              type: 'REFUND',
              amount: updatedPaymentAmount as number,
              method: paymentMethod,
              comment: paymentMethod ? `Возврат: ${paymentMethod}` : null,
            },
          });
        }
      }

      return updated.id;
    },
    { maxWait: 10000, timeout: 60000 }
    );

    const updatedRent = await prisma.rent.findUnique({
      where: { id },
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
            externalId: true,
            status: true,
          },
        },
        payment: true,
      },
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
      await prisma.bike.updateMany({
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
