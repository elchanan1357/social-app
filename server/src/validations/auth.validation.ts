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
    .min(6, 'Password must be at least 6 characters')
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

export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email address'),
});

export const verifyOtpSchema = z.object({
  email: z.string({ message: 'Email is required' }).email('Invalid email address'),
  code: z
    .string({ message: 'OTP code is required' })
    .regex(/^\d{6}$/, 'OTP code must be exactly 6 digits'),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string({ message: 'Reset token is required' }).min(1, 'Reset token is required'),
  newPassword: z
    .string({ message: 'New password is required' })
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;