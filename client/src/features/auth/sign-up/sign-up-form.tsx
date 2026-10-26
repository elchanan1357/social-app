// import { useState } from 'react'
// import { z } from 'zod'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useNavigate } from '@tanstack/react-router'
// import { IconGoogle, IconGithub } from '@/assets/brand-icons'
// import { cn } from '@/lib/utils'
// import { useAuthStore } from '@/stores/auth-store'
// import { Button } from '@/components/ui/button'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { PasswordInput } from '@/components/password-input'

// const formSchema = z
//   .object({
//     email: z
//       .string()
//       .min(1, 'Please enter your email')
//       .email('Please enter a valid email address'),
//     password: z
//       .string()
//       .min(1, 'Please enter your password')
//       .min(6, 'Password must be at least 6 characters long'),
//     confirmPassword: z.string().min(1, 'Please confirm your password'),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords don't match.",
//     path: ['confirmPassword'],
//   })

// export function SignUpForm({
//   className,
//   ...props
// }: React.HTMLAttributes<HTMLFormElement>) {
//   const [isLoading, setIsLoading] = useState(false)
//   const navigate = useNavigate()
//   const register = useAuthStore((state) => state.auth.register)

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: '',
//       password: '',
//       confirmPassword: '',
//     },
//   })

//   async function onSubmit(data: z.infer<typeof formSchema>) {
//     setIsLoading(true)

//     try {
//       await register({
//         email: data.email,
//         password: data.password,
//       })

//       navigate({ to: '/404' })
//     } catch (error) {
//       console.error('Registration failed:', error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className={cn('grid gap-3', className)}
//         {...props}
//       >
//         <FormField
//           control={form.control}
//           name='email'
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Email</FormLabel>
//               <FormControl>
//                 <Input placeholder='name@example.com' disabled={isLoading} {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name='password'
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Password</FormLabel>
//               <FormControl>
//                 <PasswordInput placeholder='********' disabled={isLoading} {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name='confirmPassword'
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Confirm Password</FormLabel>
//               <FormControl>
//                 <PasswordInput placeholder='********' disabled={isLoading} {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <Button className='mt-2' type='submit' disabled={isLoading}>
//           {isLoading ? 'Creating Account...' : 'Create Account'}
//         </Button>

//         <div className='relative my-2'>
//           <div className='absolute inset-0 flex items-center'>
//             <span className='w-full border-t' />
//           </div>
//           <div className='relative flex justify-center text-xs uppercase'>
//             <span className='bg-background text-muted-foreground px-2'>
//               Or continue with
//             </span>
//           </div>
//         </div>

//         <div className='grid grid-cols-2 gap-2'>
//           <Button
//             variant='outline'
//             className='w-full'
//             type='button'
//             disabled={isLoading}
//           >
//             <IconGithub className='h-4 w-4' /> GitHub
//           </Button>
//           <Button
//             variant='outline'
//             className='w-full'
//             type='button'
//             disabled={isLoading}
//           >
//             <IconGoogle className='h-4 w-4' /> Google
//           </Button>
//         </div>
//       </form>
//     </Form>
//   )
// }


import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { IconGoogle, IconGithub } from '@/assets/brand-icons'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z
  .object({
    firstName: z.string().min(1, 'Please enter your first name'),
    lastName: z.string().min(1, 'Please enter your last name'),
    email: z
      .string()
      .min(1, 'Please enter your email')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Please enter your password')
      .min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.auth.register)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      } as any)

      navigate({ to: '/404' })
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        {/* שורה כפולה עבור שם פרטי ושם משפחה */}
        <div className='grid grid-cols-2 gap-2'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder='John' disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder='Doe' disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' type='submit' disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button
            variant='outline'
            className='w-full'
            type='button'
            disabled={isLoading}
          >
            <IconGithub className='h-4 w-4' /> GitHub
          </Button>
          <Button
            variant='outline'
            className='w-full'
            type='button'
            disabled={isLoading}
          >
            <IconGoogle className='h-4 w-4' /> Google
          </Button>
        </div>
      </form>
    </Form>
  )
}