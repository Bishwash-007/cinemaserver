import { z } from 'zod';

const isoDate = z
  .string()
  .datetime({ message: 'Must be a valid ISO 8601 date string' })
  .optional();

export const reportQuerySchema = z.object({
  from: isoDate,
  to: isoDate,
  granularity: z.enum(['day', 'week', 'month', 'year']).optional(),
});

export const reportMoviesQuerySchema = reportQuerySchema.extend({
  limit: z.coerce.number().int().positive().max(100).optional(),
});
