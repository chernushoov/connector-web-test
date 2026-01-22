'use client'

import { useState, useEffect } from 'react'
import { ToastProvider } from '@/components/ui/Toast'

// ============================================
// PROVIDERS COMPONENT
// ============================================

export function Providers({ children }: { children: React.ReactNode }) {
  // Handle hydration mismatch
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder during SSR to avoid hydration mismatch
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            {/* Brand logo placeholder */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-brand animate-pulse" />
            <div className="w-24 h-4 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
