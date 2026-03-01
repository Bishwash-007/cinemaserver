import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  bookingId: z.number().int().positive(),
  provider: z.enum(['stripe', 'razorpay']).default('stripe'),
});

export const verifyPaymentSchema = z.object({
  bookingId: z.number().int().positive(),
  transactionId: z.string().min(1),
  provider: z.enum(['stripe', 'razorpay']),
  providerPayload: z.record(z.unknown()).optional(),
});

export const refundPaymentSchema = z.object({
  bookingId: z.number().int().positive(),
  reason: z.string().max(500).optional(),
});
