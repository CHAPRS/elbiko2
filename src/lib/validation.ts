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
  imageUrl: z.string().url().max(500).optional().nullable(),
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
  imageUrl: z.string().url().max(500).optional().nullable(),
});

export const leadStatus = z.enum(['NEW', 'IN_PROGRESS', 'CONVERTED', 'REJECTED']);

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
});

export const createLeadManualSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(5).max(30),
  bikeName: z.string().max(120).optional().nullable(),
  bikeId: z.number().int().positive(),
  message: z.string().max(2000).optional().nullable(),
  rentDays: z.number().int().positive().max(365),
  totalPrice: z.number().positive().max(10000000),
});

export const createOrderSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(5).max(30),
  bikeName: z.string().min(1).max(120),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});
