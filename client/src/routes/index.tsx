import { createFileRoute, redirect } from '@tanstack/react-router'
// import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const isAuthenticated =false // useAuthStore.getState().auth.isAuthenticated

    if (!isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }

    throw redirect({ to: '/401' })
  },
})