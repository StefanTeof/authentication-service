import { z } from 'zod';

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),

  token: z
    .string()
    .min(1, 'Token is required'),

  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must include at least one letter and one number'),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
