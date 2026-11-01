import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { authApi, type LoginPayload, type RegisterPayload } from '@/api/auth.api'

const ACCESS_TOKEN = 'access_token'

export interface AuthUser {
  userId: string
  email?: string
  role: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    accessToken: string
    setUser: (user: AuthUser | null) => void
    setAccessToken: (accessToken: string) => void
    login: (credentials: LoginPayload) => Promise<void>
    register: (userData: RegisterPayload) => Promise<void>
    logout: () => Promise<void>
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? cookieState : ''

  return {
    auth: {
      user: null,
      accessToken: initToken,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, accessToken)
          return { ...state, auth: { ...state.auth, accessToken } }
        }),


      login: async (credentials) => {
        const { data } = await authApi.login(credentials)

        get().auth.setAccessToken(data.accessToken)
        get().auth.setUser(data.user)
      },

      register: async (userData) => {
        const { data } = await authApi.register(userData)

        get().auth.setAccessToken(data.accessToken)
        get().auth.setUser(data.user)
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          console.error('Logout error on server:', error)
        } finally {
          get().auth.reset()
        }
      },

      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),

      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})