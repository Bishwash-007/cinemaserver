import { z } from 'zod';

export const createBookingSchema = z.object({
  showtimeId: z.number().int().positive(),
  seatIds: z.array(z.number().int().positive()).min(1).max(10),
  discountCode: z.string().optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const bookingQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'failed']).optional(),
});

export const createDiscountCodeSchema = z.object({
  code: z.string().min(1).max(50),
  description: z.string().optional(),
  type: z.enum(['percentage', 'flat']),
  scope: z.enum(['booking', 'ticket']).default('booking'),
  value: z.number().positive(),
  minAmount: z.number().positive().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  maxUsageCount: z.number().int().positive().optional(),
  maxUsagePerUser: z.number().int().positive().default(1),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  isStackable: z.boolean().default(false),
});

export const validateDiscountSchema = z.object({
  code: z.string().min(1),
  showtimeId: z.number().int().positive(),
  seatCount: z.number().int().positive(),
  totalAmount: z.number().positive(),
});
