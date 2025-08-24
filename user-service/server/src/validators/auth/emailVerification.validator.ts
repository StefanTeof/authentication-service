import { z } from 'zod';

export const verifyEmailParamsSchema = z.object({
  userId: z.string().min(1),
});

export const verifyEmailBodySchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Verification code must be a 6-digit number'),
});

export type VerifyEmailParams = z.infer<typeof verifyEmailParamsSchema>;
export type VerifyEmailBody = z.infer<typeof verifyEmailBodySchema>;