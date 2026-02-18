'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/shared'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <ErrorState
        type="generic"
        onRetry={reset}
      />
    </div>
  )
}
