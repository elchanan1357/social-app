import { createFileRoute } from '@tanstack/react-router'
import { OAuthCallback } from '@/features/auth/oauth-callback'

export const Route = createFileRoute('/(auth)/oauth-callback')({
  validateSearch: (search: Record<string, unknown>): { error?: string } => ({
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: OAuthCallback,
})