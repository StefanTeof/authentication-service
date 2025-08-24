import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier (email or username) is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      'Password must include at least one letter and one number'
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;