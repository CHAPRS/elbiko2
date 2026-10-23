import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Обновление аренды АКБ (завершение, продление, замена АКБ, оплата, долг)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const {
      status,
      batteryId,
      startDate,
      endDate,
      totalPrice,
      comment,
      extendDays,
      extendBatteryId,
      extendPrice,
      paidAmount,
      paidMethod,
      debtDueDate,
      penaltyAmount,
      penaltyComment,
      penaltyPaid,
      penaltyMethod,
    } = body;

    const rent = await prisma.batteryRent.findUnique({
      where: { id },
      include: { battery: true },
    });

    if (!rent) {
      return NextResponse.json(
        { error: 'Аренда не найдена' },
        { status: 404 }
      );
    }

    // «Получено сейчас»: полная или частичная оплата (при продлении или отдельно)
    let cashReceived: number | null = null;
    if (paidAmount !== undefined && paidAmount !== null && paidAmount !== '') {
      const parsed = Number(paidAmount);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return NextResponse.json(
          { error: 'Некорректная сумма оплаты' },
          { status: 400 }
        );
      }
      cashReceived = Math.round(parsed * 100) / 100;
    }

    // Штраф/ущерб: начисление увеличивает долг аренды
    let penaltyCharge: number | null = null;
    if (penaltyAmount !== undefined && penaltyAmount !== null && penaltyAmount !== '') {
      const parsed = Number(penaltyAmount);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return NextResponse.json(
          { error: 'Некорректная сумма штрафа' },
          { status: 400 }
        );
      }
      penaltyCharge = Math.round(parsed * 100) / 100;
    }

    // Планируемая дата погашения долга (null/'' — снять)
    let debtDueDateProvided = false;
    let parsedDebtDueDate: Date | null = null;
    if (debtDueDate !== undefined) {
      debtDueDateProvided = true;
      if (debtDueDate === null || debtDueDate === '') {
        parsedDebtDueDate = null;
      } else {
        const d = new Date(debtDueDate);
        if (isNaN(d.getTime())) {
          return NextResponse.json(
            { error: 'Некорректная дата погашения долга' },
            { status: 400 }
          );
        }
        parsedDebtDueDate = d;
      }
    }

    let overpaid = false;
    let paidTotalOut = 0;
    let debtOut = 0;
    let penaltiesOut = 0;

    const updatedRentId = await prisma.$transaction(
      async (tx) => {
      let updateData: any = {};
      let extensionCharge = 0;

      // Обновление статуса
      if (status) {
        updateData.status = status;

        const currentBattery =
          rent.battery ?? (rent.batteryId ? await tx.battery.findUnique({ where: { id: rent.batteryId } }) : null);

        if (status === 'RETURNED') {
          updateData.isActive = false;
          updateData.actualReturnDate = new Date();
          if (currentBattery && currentBattery.status !== 'FREE') {
            await tx.battery.update({
              where: { id: currentBattery.id },
              data: { status: 'FREE' },
            });
          }
        }

        if (status === 'COMPLETED' || status === 'CANCELLED') {
          updateData.isActive = false;
          if (currentBattery && currentBattery.status !== 'FREE') {
            await tx.battery.update({
              where: { id: currentBattery.id },
              data: { status: 'FREE' },
            });
          }
        }

        if (status === 'OVERDUE') {
          updateData.isActive = false;
        }

        // Реактивация/возврат в ACTIVE или OVERDUE — аккумулятор снова занят
        if ((status === 'ACTIVE' || status === 'OVERDUE') && currentBattery && currentBattery.status !== 'RENTED') {
          await tx.battery.update({
            where: { id: currentBattery.id },
            data: { status: 'RENTED' },
          });
        }
      }

      // Продление аренды с возможностью замены АКБ и ручной стоимости
      if (extendDays && extendDays > 0) {
        if (['COMPLETED', 'CANCELLED', 'RETURNED'].includes(rent.status)) {
          throw new Error('Нельзя продлить завершённую или отменённую аренду');
        }

        const extensionDays = Number(extendDays);
        const targetBatteryId = extendBatteryId ? Number(extendBatteryId) : rent.batteryId;
        const targetBattery = await tx.battery.findUnique({ where: { id: targetBatteryId } });

        if (!targetBattery) {
          throw new Error('Выбранный аккумулятор не найден');
        }

        if (targetBatteryId !== rent.batteryId && targetBattery.status !== 'FREE') {
          throw new Error('Новый аккумулятор недоступен для замены');
        }

        let additionalPrice = 0;
        if (extendPrice !== undefined && extendPrice !== null && extendPrice !== '') {
          additionalPrice = Number(extendPrice);
        } else {
          additionalPrice = Number(targetBattery.pricePerDay ?? 0) * extensionDays;
        }

        if (!Number.isFinite(additionalPrice) || additionalPrice < 0) {
          throw new Error('Стоимость продления не может быть отрицательной или некорректной');
        }
        extensionCharge = additionalPrice;

        const currentEndDate = new Date(rent.endDate);
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() + extensionDays);

        const newTotalPrice = Number(rent.totalPrice ?? 0) + additionalPrice;
        if (!Number.isFinite(newTotalPrice) || newTotalPrice < 0) {
          throw new Error('Итоговая стоимость аренды некорректна');
        }

        updateData.endDate = newEndDate;
        updateData.totalPrice = newTotalPrice;

        // Замена аккумулятора при продлении
        if (targetBatteryId !== rent.batteryId) {
          await tx.battery.updateMany({ where: { id: rent.batteryId }, data: { status: 'FREE' } });
          await tx.battery.update({ where: { id: targetBatteryId }, data: { status: 'RENTED' } });
          updateData.batteryId = targetBatteryId;
        }

        // Если аренда была просрочена, а теперь endDate в будущем — возвращаем ACTIVE
        if (rent.status === 'OVERDUE' && newEndDate > new Date()) {
          updateData.status = 'ACTIVE';
          updateData.isActive = true;
        }

        await tx.batteryRentTransaction.create({
          data: {
            batteryRentId: id,
            type: 'EXTEND',
            amount: additionalPrice,
            comment: `Продление на ${extensionDays} дн.${
              targetBatteryId !== rent.batteryId ? ` (замена на ${targetBattery.name})` : ''
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

      // Замена аккумулятора во время аренды
      const newBatteryId = batteryId ? Number(batteryId) : null;
      if (newBatteryId && newBatteryId !== rent.batteryId) {
        const newBattery = await tx.battery.findUnique({ where: { id: newBatteryId } });
        if (!newBattery) {
          throw new Error('Новый аккумулятор не найден');
        }
        if (newBattery.status !== 'FREE') {
          throw new Error('Новый аккумулятор недоступен для замены');
        }

        await tx.battery.updateMany({ where: { id: rent.batteryId }, data: { status: 'FREE' } });
        await tx.battery.update({ where: { id: newBatteryId }, data: { status: 'RENTED' } });

        updateData.batteryId = newBatteryId;
      }

      // Итоговая стоимость аренды после всех правок этого запроса
      const effectiveTotal =
        updateData.totalPrice !== undefined && updateData.totalPrice !== null && updateData.totalPrice !== ''
          ? Number(updateData.totalPrice)
          : Number(rent.totalPrice ?? 0);

      // Сколько уже внесено и начислено штрафами — денежный журнал
      const [paidAgg, refundAgg, penaltyAgg] = await Promise.all([
        tx.batteryRentTransaction.aggregate({
          where: { batteryRentId: id, type: 'PAYMENT' },
          _sum: { amount: true },
        }),
        tx.batteryRentTransaction.aggregate({
          where: { batteryRentId: id, type: 'REFUND' },
          _sum: { amount: true },
        }),
        tx.batteryRentTransaction.aggregate({
          where: { batteryRentId: id, type: 'PENALTY' },
          _sum: { amount: true },
        }),
      ]);
      let paidSoFar =
        Number(paidAgg._sum.amount ?? 0) - Number(refundAgg._sum.amount ?? 0);
      let penaltiesTotal = Number(penaltyAgg._sum.amount ?? 0);

      // Начисление штрафа/ущерба — увеличивает начисленное по аренде
      if (penaltyCharge !== null) {
        await tx.batteryRentTransaction.create({
          data: {
            batteryRentId: id,
            type: 'PENALTY',
            amount: penaltyCharge,
            comment:
              typeof penaltyComment === 'string' && penaltyComment.trim()
                ? penaltyComment.trim()
                : 'Штраф/ущерб',
          },
        });
        penaltiesTotal += penaltyCharge;

        // «Оплачен сразу» — сразу проводим оплату тем же способом
        if (penaltyPaid) {
          await tx.batteryRentTransaction.create({
            data: {
              batteryRentId: id,
              type: 'PAYMENT',
              amount: penaltyCharge,
              method: penaltyMethod ?? null,
              comment: 'Оплата штрафа',
            },
          });
          paidSoFar += penaltyCharge;
        }
      }

      // Начислено по аренде: цена аренды + штрафы
      const effectiveCharge = effectiveTotal + penaltiesTotal;

      // Полученные сейчас деньги: полная/частичная оплата или погашение долга
      if (cashReceived !== null) {
        const due = Math.max(0, effectiveCharge - paidSoFar);
        if (cashReceived > due + 0.001) overpaid = true;

        await tx.batteryRentTransaction.create({
          data: {
            batteryRentId: id,
            type: 'PAYMENT',
            amount: cashReceived,
            method: paidMethod ?? null,
            comment: extensionCharge > 0
              ? `Оплата при продлении${cashReceived < extensionCharge ? ' (частичная)' : ''}`
              : 'Внесение оплаты',
          },
        });
        paidSoFar += cashReceived;
      }

      // Долг = начислено (цена + штрафы) − внесено; дата погашения сбрасывается при нулевом долге
      const newDebt = Math.round(Math.max(0, effectiveCharge - paidSoFar) * 100) / 100;
      if (debtDueDateProvided) {
        updateData.debtDueDate = newDebt > 0 ? parsedDebtDueDate : null;
      } else if (newDebt <= 0) {
        updateData.debtDueDate = null;
      }
      paidTotalOut = Math.max(0, Math.round(paidSoFar * 100) / 100);
      debtOut = newDebt;
      penaltiesOut = penaltiesTotal;

      const updated = await tx.batteryRent.update({
        where: { id },
        data: updateData,
      });

      return updated.id;
    },
    { maxWait: 10000, timeout: 60000 }
    );

    const updatedRent = await prisma.batteryRent.findUnique({
      where: { id: updatedRentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        battery: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...updatedRent,
      overpaid,
      paidTotal: paidTotalOut,
      debt: debtOut,
      penaltiesTotal: penaltiesOut,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка при обновлении аренды АКБ';
    console.error('Ошибка при обновлении аренды АКБ:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// DELETE - Удаление аренды АКБ (с освобождением аккумулятора)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    const rent = await prisma.batteryRent.findUnique({
      where: { id },
    });

    if (rent) {
      // Освобождаем аккумулятор
      await prisma.battery.updateMany({
        where: { id: rent.batteryId },
        data: { status: 'FREE' },
      });
    }

    await prisma.batteryRent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении аренды АКБ:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении аренды АКБ' },
      { status: 500 }
    );
  }
}
