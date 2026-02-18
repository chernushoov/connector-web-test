'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store'

interface UseAuthGateReturn {
  isAuthenticated: boolean
  requireAuth: (callback: () => void, options?: { action?: string }) => void
  redirectToLogin: (returnPath?: string) => void
}

export function useAuthGate(): UseAuthGateReturn {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const redirectToLogin = useCallback((returnPath?: string) => {
    const path = returnPath || window.location.pathname
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingAction', path)
    }
    router.push('/login')
  }, [router])

  const requireAuth = useCallback((callback: () => void, options?: { action?: string }) => {
    if (!isAuthenticated) {
      if (options?.action && typeof window !== 'undefined') {
        localStorage.setItem('pendingActionDescription', options.action)
      }
      redirectToLogin()
      return
    }
    callback()
  }, [isAuthenticated, redirectToLogin])

  return {
    isAuthenticated,
    requireAuth,
    redirectToLogin,
  }
}

export function usePendingAction() {
  const router = useRouter()

  const resumePendingAction = useCallback(() => {
    if (typeof window === 'undefined') return null

    const pendingPath = localStorage.getItem('pendingAction')
    const pendingDescription = localStorage.getItem('pendingActionDescription')

    localStorage.removeItem('pendingAction')
    localStorage.removeItem('pendingActionDescription')

    if (pendingPath && pendingPath !== '/login') {
      router.push(pendingPath)
      return pendingDescription
    }

    return null
  }, [router])

  return { resumePendingAction }
}
