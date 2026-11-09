import { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { authApi } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './otp-form'

export function Otp() {
  const { email } = useSearch({ strict: false }) as { email?: string }
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  function handleResendCode() {
    if (!email || countdown > 0 || isResending) return
    setIsResending(true)

    toast.promise(authApi.forgotPassword(email), {
      loading: 'Sending new code...',
      success: () => {
        setCountdown(60)
        return 'A new verification code has been sent to your email.'
      },
      error: (err) => err.response?.data?.message || 'Failed to send new code.',
      finally: () => setIsResending(false),
    })
  }

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-base tracking-tight'>
            Two-factor Authentication
          </CardTitle>
          <CardDescription>
            Please enter the authentication code. <br /> We have sent the
            authentication code to your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm />
        </CardContent>
        <CardFooter className='flex-col gap-2'>
          <p className='text-muted-foreground text-center text-sm'>
            Haven't received it?{' '}
            <Button
              variant='link'
              className='hover:text-primary h-auto p-0 underline underline-offset-4'
              onClick={handleResendCode}
              disabled={isResending || countdown > 0}
            >
              {countdown > 0
                ? `Resend a new code in ${countdown}s`
                : 'Resend a new code.'}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}