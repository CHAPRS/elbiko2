import { z } from 'zod';

export const bikeStatus = z.enum(['FREE', 'RENTED', 'MAINTENANCE', 'BLOCKED']);

export const createBikeSchema = z.object({
  name: z.string().min(1).max(120),
  speed: z.string().min(1).max(80),
  range: z.string().min(1).max(80),
  motor: z.string().min(1).max(80),
  isWaterproof: z.boolean().optional(),
  pricePerDay: z.number().int().positive().max(100000),
  status: bikeStatus.optional(),
  externalId: z.string().max(120).optional().nullable(),
  imageUrl: z.string().url().max(500).optional().nullable(),
  purchasePrice: z.number().finite().nonnegative().max(10000000).optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(),
  mileage: z.number().int().nonnegative().optional().nullable(),
});

export const updateBikeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(120).optional(),
  speed: z.string().min(1).max(80).optional(),
  range: z.string().min(1).max(80).optional(),
  motor: z.string().min(1).max(80).optional(),
  isWaterproof: z.boolean().optional(),
  pricePerDay: z.number().int().positive().max(100000).optional(),
  status: bikeStatus.optional(),
  externalId: z.string().max(120).optional().nullable(),
  imageUrl: z.string().url().max(500).optional().nullable(),
  purchasePrice: z.number().finite().nonnegative().max(10000000).optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(),
  mileage: z.number().int().nonnegative().optional().nullable(),
});

export const leadStatus = z.enum(['NEW', 'IN_PROGRESS', 'CONFIRMED', 'REJECTED']);

export const updateLeadSchema = z.object({
  status: leadStatus.optional(),
  comment: z.string().max(1000).optional().nullable(),
  rejectReason: z.string().max(500).optional().nullable(),
  bikeId: z.number().int().positive().optional().nullable(),
});

export const createLeadSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(5).max(30),
  bikeName: z.string().max(120).optional().nullable(),
  bikeId: z.number().int().positive().optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

export const createLeadManualSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(5).max(30),
  bikeName: z.string().max(120).optional().nullable(),
  bikeId: z.number().int().positive(),
  message: z.string().max(2000).optional().nullable(),
  rentDays: z.number().int().positive().max(365).optional().nullable(),
  totalPrice: z.number().positive().max(10000000).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

export const miscTransactionKind = z.enum(['INCOME', 'EXPENSE']);
export const paymentMethodEnum = z.enum(['CASH', 'SBP', 'CARD', 'TRANSFER']);

export const createMiscTransactionSchema = z.object({
  kind: miscTransactionKind,
  title: z.string().min(1).max(200),
  amount: z.number().finite().positive().max(10000000),
  method: paymentMethodEnum.optional().nullable(),
  bikeId: z.number().int().positive().optional().nullable(),
  comment: z.string().max(1000).optional().nullable(),
  createdAt: z.coerce.date().optional().nullable(),
});

export const updateMiscTransactionSchema = z.object({
  kind: miscTransactionKind.optional(),
  title: z.string().min(1).max(200).optional(),
  amount: z.number().finite().positive().max(10000000).optional(),
  method: paymentMethodEnum.optional().nullable(),
  bikeId: z.number().int().positive().optional().nullable(),
  comment: z.string().max(1000).optional().nullable(),
  createdAt: z.coerce.date().optional().nullable(),
});

export const buyoutStatus = z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']);
export const buyoutPaymentStatus = z.enum(['PENDING', 'PAID']);
export const buyoutInterval = z.enum(['WEEKLY', 'MONTHLY']);

export const buyoutPaymentItemSchema = z.object({
  dueDate: z.coerce.date(),
  amount: z.number().finite().positive().max(10000000),
  comment: z.string().max(500).optional().nullable(),
});

export const buyoutScheduleSchema = z.object({
  firstDate: z.coerce.date(),
  count: z.number().int().positive().max(120),
  interval: buyoutInterval,
});

export const createBuyoutSchema = z.object({
  title: z.string().min(1).max(200),
  clientName: z.string().min(1).max(120),
  clientPhone: z.string().max(30).optional().nullable(),
  bikeId: z.number().int().positive().optional().nullable(),
  totalPrice: z.number().finite().positive().max(10000000),
  startDate: z.coerce.date().optional().nullable(),
  comment: z.string().max(1000).optional().nullable(),
  payments: z.array(buyoutPaymentItemSchema).max(120).optional(),
  schedule: buyoutScheduleSchema.optional(),
});

export const updateBuyoutSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  clientName: z.string().min(1).max(120).optional(),
  clientPhone: z.string().max(30).optional().nullable(),
  bikeId: z.number().int().positive().optional().nullable(),
  totalPrice: z.number().finite().positive().max(10000000).optional(),
  status: buyoutStatus.optional(),
  startDate: z.coerce.date().optional().nullable(),
  comment: z.string().max(1000).optional().nullable(),
});

export const createBuyoutPaymentSchema = z.object({
  dueDate: z.coerce.date(),
  amount: z.number().finite().positive().max(10000000),
  comment: z.string().max(500).optional().nullable(),
});

export const updateBuyoutPaymentSchema = z.object({
  dueDate: z.coerce.date().optional(),
  amount: z.number().finite().positive().max(10000000).optional(),
  status: buyoutPaymentStatus.optional(),
  method: paymentMethodEnum.optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
});

export const createOrderSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(5).max(30),
  bikeName: z.string().min(1).max(120),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});
