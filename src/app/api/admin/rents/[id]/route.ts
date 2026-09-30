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
      mileage,
      mileageNote,
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

    // Опциональный пробег: фиксируется при завершении/продлении аренды
    let mileageValue: number | null = null;
    if (mileage !== undefined && mileage !== null && mileage !== '') {
      const parsed = Number(mileage);
      if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
        return NextResponse.json(
          { error: 'Некорректное значение пробега' },
          { status: 400 }
        );
      }
      mileageValue = parsed;
    }
    const previousMileage = rent.bike?.mileage ?? null;
    const mileageWarning =
      mileageValue !== null && previousMileage !== null && mileageValue < previousMileage;

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
          additionalPrice = Number(targetBike.pricePerDay ?? 0) * extensionDays;
        }

        if (!Number.isFinite(additionalPrice) || additionalPrice < 0) {
          throw new Error('Стоимость продления не может быть отрицательной или некорректной');
        }

        const currentEndDate = new Date(rent.endDate);
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() + extensionDays);

        const newTotalPrice = Number(rent.totalPrice ?? 0) + additionalPrice;
        if (!Number.isFinite(newTotalPrice) || newTotalPrice < 0) {
          throw new Error('Итоговая стоимость аренды некорректна');
        }

        updateData.endDate = newEndDate;
        updateData.totalPrice = newTotalPrice;

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
        const manualTotal = Number(totalPrice);
        if (!Number.isFinite(manualTotal) || manualTotal < 0) {
          throw new Error('Некорректная стоимость аренды');
        }
        updateData.totalPrice = manualTotal;
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

      const updated = await tx.rent.update({
        where: { id },
        data: updateData,
      });

      // Фиксируем пробег на байке, который был в этой аренде
      if (mileageValue !== null) {
        await tx.mileageLog.create({
          data: {
            bikeId: rent.bikeId,
            rentId: id,
            mileage: mileageValue,
            note: typeof mileageNote === 'string' && mileageNote.trim() ? mileageNote.trim() : null,
          },
        });
        await tx.bike.update({
          where: { id: rent.bikeId },
          data: { mileage: mileageValue },
        });
      }

      // Обновляем/создаём платёж по аренде
      if (paymentStatus) {
        const allowedPaymentStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
        if (!allowedPaymentStatuses.includes(paymentStatus)) {
          throw new Error('Некорректный статус платежа');
        }

        const paidAt = paymentStatus === 'COMPLETED' ? new Date() : null;

        const finalPaymentAmountSource =
          updateData.totalPrice !== undefined && updateData.totalPrice !== null && updateData.totalPrice !== ''
            ? Number(updateData.totalPrice)
            : rent.payment
            ? Number(rent.payment.amount)
            : Number(rent.totalPrice ?? 0);
        const finalPaymentAmount = Math.round(finalPaymentAmountSource * 100) / 100;

        if (!Number.isFinite(finalPaymentAmount) || finalPaymentAmount < 0) {
          throw new Error('Некорректная сумма платежа');
        }

        if (rent.payment) {
          await tx.payment.update({
            where: { id: rent.payment.id },
            data: {
              amount: finalPaymentAmount,
              status: paymentStatus,
              paymentMethod,
              paidAt,
            },
          });
        } else {
          await tx.payment.create({
            data: {
              rentId: id,
              amount: finalPaymentAmount,
              status: paymentStatus,
              paymentMethod,
              paidAt,
            },
          });
        }

        if (paymentStatus === 'COMPLETED' || paymentStatus === 'REFUNDED') {
          await tx.rentTransaction.create({
            data: {
              rentId: id,
              type: paymentStatus === 'COMPLETED' ? 'PAYMENT' : 'REFUND',
              amount: finalPaymentAmount,
              method: paymentMethod,
              comment: paymentMethod
                ? `${paymentStatus === 'COMPLETED' ? 'Оплата' : 'Возврат'}: ${paymentMethod}`
                : null,
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

    return NextResponse.json({ ...updatedRent, mileageWarning });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка при обновлении аренды';
    console.error('Ошибка при обновлении аренды:', error);
    return NextResponse.json(
      { error: message },
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
