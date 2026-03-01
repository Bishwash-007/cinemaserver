import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  age: z.number().int().min(1).max(120).optional(),
  phoneNumber: z.string().max(20).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'user', 'guest']),
});
