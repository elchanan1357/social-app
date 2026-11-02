import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ResetPasswordForm } from './reset-password-form'

export function ResetPassword() {
    return (
        <AuthLayout>
            <Card className='gap-4'>
                <CardHeader>
                    <CardTitle className='text-base tracking-tight'>Set a new password</CardTitle>
                    <CardDescription>
                        Choose a strong password for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResetPasswordForm />
                </CardContent>
            </Card>
        </AuthLayout>
    )
}