import { IconGoogle, IconFacebook } from '@/assets/brand-icons'
import { getOAuthUrl, type OAuthProvider } from '@/api/auth.api'
import { Button } from '@/components/ui/button'

interface SocialAuthButtonsProps {
    disabled?: boolean
}

export function SocialAuthButtons({ disabled }: SocialAuthButtonsProps) {
    function start(provider: OAuthProvider) {
        window.location.assign(getOAuthUrl(provider))
    }

    return (
        <div className='grid grid-cols-2 gap-2'>
            <Button
                variant='outline'
                type='button'
                className='w-full'
                disabled={disabled}
                onClick={() => start('facebook')}
            >
                <IconFacebook className='h-4 w-4' /> Facebook
            </Button>
            <Button
                variant='outline'
                type='button'
                className='w-full'
                disabled={disabled}
                onClick={() => start('google')}
            >
                <IconGoogle className='h-4 w-4' /> Google
            </Button>
        </div>
    )
}