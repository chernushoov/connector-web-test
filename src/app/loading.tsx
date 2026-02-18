'use client'

import { LoadingState } from '@/components/shared'

export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <LoadingState size="lg" variant="dots" />
    </div>
  )
}
