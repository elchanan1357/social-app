import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  ref?: React.Ref<HTMLInputElement>
}

export function PasswordInput({
  className,
  disabled,
  ref,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className={cn('relative rounded-md', className)}>
      <input
        type={showPassword ? 'text' : 'password'}
        className={cn(
          'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 pe-9 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50'
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
      <Button
        type='button'
        size='icon'
        variant='ghost'
        tabIndex={-1}
        disabled={disabled}
        className='text-muted-foreground absolute end-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-md hover:bg-transparent'
        onClick={(e) => {
          e.preventDefault()
          setShowPassword((prev) => !prev)
        }}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
    </div>
  )
}