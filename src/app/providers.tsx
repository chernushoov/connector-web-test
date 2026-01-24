'use client'

import { useState, useEffect } from 'react'
import { ToastProvider } from '@/components/ui/Toast'
import { TrialEndModal } from '@/components/subscription'
import { useTrial } from '@/hooks'
import { ChatWidget } from '@/components/support'

// ============================================
// PROVIDERS COMPONENT
// ============================================

function TrialManager() {
  const { checkTrialStatus, isTrialActive } = useTrial()

  // Check trial status periodically
  useEffect(() => {
    if (isTrialActive) {
      const interval = setInterval(checkTrialStatus, 60000) // Every minute
      return () => clearInterval(interval)
    }
  }, [isTrialActive, checkTrialStatus])

  return <TrialEndModal />
}

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
            {/* Brand logo */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center animate-pulse">
              <span className="text-white font-bold text-3xl">C</span>
            </div>
            <div className="w-24 h-4 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      {children}
      <TrialManager />
      <ChatWidget />
    </ToastProvider>
  )
}
