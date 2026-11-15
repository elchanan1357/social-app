import { useEffect, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth-store'

export function OAuthCallback() {
  const navigate = useNavigate()
  const { error } = useSearch({ strict: false }) as { error?: string }
  const { setAccessToken, setUser } = useAuthStore((state) => state.auth)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    async function finish() {
      if (error) {
        toast.error(error)
        navigate({ to: '/sign-in', replace: true })
        return
      }

      try {
        const { data: refreshed } = await authApi.refresh()
        setAccessToken(refreshed.accessToken)

        const { data } = await authApi.me(refreshed.accessToken)
        setUser(data.user)

        toast.success('Welcome!')
        navigate({ to: '/404', replace: true })
      } catch {
        toast.error('Sign-in failed. Please try again.')
        navigate({ to: '/sign-in', replace: true })
      }
    }

    finish()
  }, [error, navigate, setAccessToken, setUser])

  return (
    <div className='flex h-svh items-center justify-center'>
      <Loader2 className='animate-spin' />
    </div>
  )
}