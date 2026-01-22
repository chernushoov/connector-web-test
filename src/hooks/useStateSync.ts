'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useConnectorStore } from '@/store'

type SyncResource = 'applications' | 'shifts' | 'messages' | 'notifications'

interface SyncConfig {
  resource: SyncResource
  interval?: number // polling interval in ms
  enabled?: boolean
  onUpdate?: (data: any) => void
  onError?: (error: Error) => void
}

const DEFAULT_INTERVALS: Record<SyncResource, number> = {
  applications: 30000, // 30 seconds
  shifts: 60000, // 1 minute
  messages: 10000, // 10 seconds
  notifications: 30000, // 30 seconds
}

/**
 * Hook for syncing state with server
 *
 * Features:
 * - Polling at configurable intervals
 * - Optimistic UI updates
 * - Automatic reconnection
 * - Error handling with retry
 */
export function useStateSync(configs: SyncConfig[]) {
  const intervalsRef = useRef<Map<SyncResource, NodeJS.Timeout>>(new Map())
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<Record<SyncResource, Date | null>>({
    applications: null,
    shifts: null,
    messages: null,
    notifications: null,
  })

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Setup polling for each resource
  useEffect(() => {
    configs.forEach((config) => {
      if (config.enabled === false) return

      const interval = config.interval || DEFAULT_INTERVALS[config.resource]

      const poll = async () => {
        if (!isOnline) return

        try {
          // TODO: Replace with actual API calls
          const data = await fetchResource(config.resource)
          config.onUpdate?.(data)
          setLastSync((prev) => ({
            ...prev,
            [config.resource]: new Date(),
          }))
        } catch (error) {
          config.onError?.(error instanceof Error ? error : new Error('Sync failed'))
        }
      }

      // Initial fetch
      poll()

      // Setup interval
      const intervalId = setInterval(poll, interval)
      intervalsRef.current.set(config.resource, intervalId)
    })

    return () => {
      intervalsRef.current.forEach((intervalId) => {
        clearInterval(intervalId)
      })
      intervalsRef.current.clear()
    }
  }, [configs, isOnline])

  // Manual refresh
  const refresh = useCallback(async (resource?: SyncResource) => {
    const resourcesToRefresh = resource
      ? configs.filter((c) => c.resource === resource)
      : configs

    await Promise.all(
      resourcesToRefresh.map(async (config) => {
        try {
          const data = await fetchResource(config.resource)
          config.onUpdate?.(data)
          setLastSync((prev) => ({
            ...prev,
            [config.resource]: new Date(),
          }))
        } catch (error) {
          config.onError?.(error instanceof Error ? error : new Error('Sync failed'))
        }
      })
    )
  }, [configs])

  return {
    isOnline,
    lastSync,
    refresh,
  }
}

// Mock fetch function - replace with actual API
async function fetchResource(resource: SyncResource): Promise<any> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock data based on resource type
  switch (resource) {
    case 'applications':
      return { applications: [], count: 0 }
    case 'shifts':
      return { shifts: [], count: 0 }
    case 'messages':
      return { messages: [], unread: 0 }
    case 'notifications':
      return { notifications: [], unread: 0 }
    default:
      return {}
  }
}

/**
 * Hook for optimistic UI updates
 *
 * Usage:
 * const { optimisticUpdate, rollback } = useOptimisticUpdate()
 *
 * const handleApprove = async (workerId) => {
 *   const previous = optimisticUpdate('applications', (apps) =>
 *     apps.map(a => a.workerId === workerId ? { ...a, status: 'approved' } : a)
 *   )
 *
 *   try {
 *     await approveWorker(workerId)
 *   } catch (error) {
 *     rollback('applications', previous)
 *     showToast('Failed to approve', 'error')
 *   }
 * }
 */
export function useOptimisticUpdate<T>() {
  const previousValues = useRef<Map<string, T>>(new Map())

  const optimisticUpdate = useCallback((
    key: string,
    updater: (current: T) => T,
    currentValue: T
  ): T => {
    // Store previous value for potential rollback
    previousValues.current.set(key, currentValue)

    // Return the updated value
    return updater(currentValue)
  }, [])

  const rollback = useCallback((key: string): T | undefined => {
    const previous = previousValues.current.get(key)
    previousValues.current.delete(key)
    return previous
  }, [])

  const commit = useCallback((key: string) => {
    previousValues.current.delete(key)
  }, [])

  return {
    optimisticUpdate,
    rollback,
    commit,
  }
}

/**
 * Hook for real-time application status tracking
 */
export function useApplicationStatus(applicationId: string) {
  const [status, setStatus] = useState<{
    current: string
    lastUpdated: Date | null
    isLoading: boolean
  }>({
    current: 'pending',
    lastUpdated: null,
    isLoading: true,
  })

  useEffect(() => {
    let mounted = true

    const fetchStatus = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        if (mounted) {
          setStatus({
            current: 'pending', // Would come from API
            lastUpdated: new Date(),
            isLoading: false,
          })
        }
      } catch (error) {
        if (mounted) {
          setStatus((prev) => ({ ...prev, isLoading: false }))
        }
      }
    }

    fetchStatus()

    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [applicationId])

  return status
}

/**
 * Hook for real-time shift status tracking
 */
export function useShiftStatus(shiftId: string) {
  const [status, setStatus] = useState<{
    current: string
    applicants: number
    filled: number
    slots: number
    lastUpdated: Date | null
    isLoading: boolean
  }>({
    current: 'open',
    applicants: 0,
    filled: 0,
    slots: 1,
    lastUpdated: null,
    isLoading: true,
  })

  useEffect(() => {
    let mounted = true

    const fetchStatus = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        if (mounted) {
          setStatus({
            current: 'open', // Would come from API
            applicants: 3,
            filled: 0,
            slots: 2,
            lastUpdated: new Date(),
            isLoading: false,
          })
        }
      } catch (error) {
        if (mounted) {
          setStatus((prev) => ({ ...prev, isLoading: false }))
        }
      }
    }

    fetchStatus()

    // Poll every minute
    const interval = setInterval(fetchStatus, 60000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [shiftId])

  return status
}

/**
 * Hook for tracking unread message count
 */
export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchUnread = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 300))

        if (mounted) {
          setUnreadCount(0) // Would come from API
          setIsLoading(false)
        }
      } catch (error) {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchUnread()

    // Poll every 10 seconds
    const interval = setInterval(fetchUnread, 10000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return { unreadCount, isLoading }
}

export default useStateSync
