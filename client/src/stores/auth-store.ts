import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { api } from '@/lib/api'

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
    login: (credentials: { email: string; password?: string }) => Promise<void>
    register: (userData: { email: string; password?: string }) => Promise<void>
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
        const response = await api.post('/auth/login', credentials)
        const { accessToken, user } = response.data

        get().auth.setAccessToken(accessToken)
        get().auth.setUser(user)
      },


      register: async (userData) => {
        const response = await api.post('/auth/register', userData)
        console.log('Registration response:', response.data)  
        const { accessToken, user } = response.data

        get().auth.setAccessToken(accessToken)
        get().auth.setUser(user)
      },

      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),


      logout: async () => {
        try {

          await api.post('/auth/logout')
        } catch (error) {
          console.error('Logout error on server:', error)
        } finally {

          get().auth.reset()
        }
      },

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