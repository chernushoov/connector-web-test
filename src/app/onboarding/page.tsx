'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store'

type Step = 'welcome' | 'features'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('welcome')
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (isAuthenticated && hasSeenOnboarding) {
      router.replace('/free')
    }
  }, [router, isAuthenticated])

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-primary/5 to-white p-6 text-center">
      <h1 className="text-3xl font-bold text-neutral-900 mb-4">Welcome to Connector</h1>
      <p className="text-neutral-600 mb-8 max-w-sm">
        Find shifts, complete tasks, earn money. Connect with employers and workers across Israel.
      </p>
      <button
        onClick={handleComplete}
        className="px-8 py-3 bg-brand-primary text-white font-semibold rounded-2xl hover:bg-brand-primary/90 transition-colors"
      >
        Get Started
      </button>
    </div>
  )
}
