import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
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
import { PasswordInput } from '@/components/password-input'

const formSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'Please enter your new password')
      .min(6, 'Password must be at least 6 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function ResetPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const clearResetToken = useResetPasswordStore((state) => state.clearResetToken)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (!useResetPasswordStore.getState().resetToken) {
      navigate({ to: '/forgot-password', replace: true })
    }
  }, [navigate])

  function onSubmit(data: z.infer<typeof formSchema>) {
    const resetToken = useResetPasswordStore.getState().resetToken
    setIsLoading(true)

    toast.promise(
      authApi.resetPassword({ resetToken, newPassword: data.newPassword }),
      {
        loading: 'Updating password...',
        success: () => {
          clearResetToken()
          navigate({ to: '/sign-in', replace: true })
          return 'Password updated. Please sign in with your new password.'
        },
        error: (err) => {
          const status = err.response?.status
          if (status === 401 || status === 403) {
            clearResetToken()
            navigate({ to: '/forgot-password', replace: true })
            return 'Your reset session expired. Please request a new code.'
          }
          return err.response?.data?.message || 'Failed to update password'
        },
        finally: () => setIsLoading(false),
      }
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' type='submit' disabled={isLoading}>
          {isLoading && <Loader2 className='animate-spin' />}
          Update password
        </Button>
      </form>
    </Form>
  )
}