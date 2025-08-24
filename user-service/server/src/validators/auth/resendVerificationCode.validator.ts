import { z } from 'zod';

export const resendVerificationCodeSchema = z.object({
  email: z.email()
});

export type ResendVerificationCodeInput = z.infer<typeof resendVerificationCodeSchema>;

