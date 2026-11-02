import { create } from 'zustand'

interface ResetPasswordState {
  resetToken: string
  setResetToken: (token: string) => void
  clearResetToken: () => void
}

export const useResetPasswordStore = create<ResetPasswordState>()((set) => ({
  resetToken: '',
  setResetToken: (resetToken) => set({ resetToken }),
  clearResetToken: () => set({ resetToken: '' }),
}))