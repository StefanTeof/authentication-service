import { z } from 'zod';

export const forgotPasswordSchema = z.object({
    email: z.email('Invalid email address'),
    callbackUrl: z
        .url('Invalid callback URL')
        .refine((url) => /^https?:\/\//.test(url), {
            message: 'Callback URL must start with http:// or https://',
        }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;