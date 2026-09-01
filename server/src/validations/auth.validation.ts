import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z
    .string({ message: 'First name is required' })
    .min(2, 'First name must be at least 2 characters'),
  lastName: z
    .string({ message: 'Last name is required' })
    .min(2, 'Last name must be at least 2 characters'),
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email address'),
  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email address'),
  password: z
    .string({ message: 'Password is required' })
    .min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;