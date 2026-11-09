import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { toast } from 'sonner'
import { authApi } from '@/api/auth.api'
import { useResetPasswordStore } from '@/stores/reset-password-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'

const formSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Please enter the 6-digit code.'),
})

type OtpFormProps = React.HTMLAttributes<HTMLFormElement>

export function OtpForm({ className, ...props }: OtpFormProps) {
  const navigate = useNavigate()
  const { email } = useSearch({ strict: false }) as { email?: string }
  const setResetToken = useResetPasswordStore((state) => state.setResetToken)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: '' },
  })

  const otp = useWatch({
    control: form.control,
    name: 'otp',
  })

  useEffect(() => {
    if (!email) {
      navigate({ to: '/forgot-password', replace: true })
    }
  }, [email, navigate])

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (!email) return
    setIsLoading(true)

    toast.promise(authApi.verifyOtp({ email, code: data.otp }), {
      loading: 'Verifying code...',
      success: (res) => {
        setResetToken(res.data.resetToken)
        navigate({ to: '/reset-password', replace: true })
        return 'Code verified'
      },
      error: (err) => {
        form.reset()
        if (err.response?.status === 429 && err.response?.data?.message?.includes('revoked')) {
          navigate({ to: '/forgot-password', replace: true })
        }
        return err.response?.data?.message || 'Failed to verify code'
      },
      finally: () => setIsLoading(false),
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='otp'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='sr-only'>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  disabled={isLoading}
                  {...field}
                  containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type='submit'
          className='mt-2'
          disabled={(otp?.length ?? 0) < 6 || isLoading}
        >
          Verify
        </Button>
        {/* <p className='text-muted-foreground text-center text-sm'>
          Didn&apos;t get a code?{' '}
          <Link
            to='/forgot-password'
            className='hover:text-primary underline underline-offset-4'
          >
            Request a new one
          </Link>
        </p> */}
      </form>
    </Form>
  )
}