import { api } from '@/lib/api'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export const authApi = {
  login: (data: LoginPayload) => api.post('/auth/login', data),
  register: (data: RegisterPayload) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (data: { email: string; code: string }) =>
    api.post<{ status: string; resetToken: string }>('/auth/verify-otp', data),
  resetPassword: (data: { resetToken: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
}