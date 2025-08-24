import { z } from 'zod';
import { AuthType, UserType } from '../../models/User/user.enums';

export const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  username: z.string().min(5).max(20),
  password: z
    .string()
    .min(6)
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, 'Password must include at least one letter and one number')
    .optional(),
  bio: z.string().max(100).optional(),
  image: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?\d{10,15}$/, 'Invalid phone number format')
    .optional(),
  country: z.enum(['Macedonia', 'Albania', 'Kosovo']).optional(),
  userType: z.enum(UserType).optional(),
  authType: z.enum(AuthType).optional(),
}).superRefine((data, ctx) => {
  if (data.authType === 'site' && !data.password) {
    ctx.addIssue({
      code: 'custom',
      path: ['password'],
      message: 'Password is required when authType is "site"',
    });
  }
});

export type RegisterInput = z.infer<typeof registerSchema>;