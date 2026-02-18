'use client'

import { useRouter } from 'next/navigation'
import { ErrorState } from '@/components/shared'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <ErrorState
        type="not-found"
        title="Page not found"
        message="The page you're looking for doesn't exist or has been moved."
        onRetry={() => router.push('/')}
        retryLabel="Go home"
      />
    </div>
  )
}
