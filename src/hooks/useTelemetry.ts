'use client'

import { useCallback } from 'react'

type TelemetryEventType =
  | 'task_viewed'
  | 'task_created'
  | 'offer_sent'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'chat_opened'
  | 'task_completed'
  | 'review_submitted'
  | 'upgrade_cta_shown'
  | 'upgrade_cta_clicked'
  | 'map_interaction'
  | 'search_performed'
  | 'filter_applied'

interface TelemetryPayload {
  taskId?: string
  [key: string]: unknown
}

interface UseTelemetryReturn {
  track: (eventType: TelemetryEventType, payload?: TelemetryPayload) => void
  trackTaskView: (taskId: string) => void
  trackOfferSent: (taskId: string, price: number) => void
  trackUpgradeCTAShown: () => void
  trackUpgradeCTAClicked: () => void
  trackSearch: (query: string, resultsCount: number) => void
  trackMapInteraction: (action: 'zoom' | 'pan' | 'marker_click') => void
}

export function useTelemetry(): UseTelemetryReturn {
  const track = useCallback(async (eventType: TelemetryEventType, payload?: TelemetryPayload) => {
    try {
      await fetch('/api/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          taskId: payload?.taskId,
          payload: payload || {},
        }),
      })
    } catch (error) {
      // Silent fail - telemetry shouldn't break UX
      console.debug('Telemetry error:', error)
    }
  }, [])

  const trackTaskView = useCallback((taskId: string) => {
    track('task_viewed', { taskId })
  }, [track])

  const trackOfferSent = useCallback((taskId: string, price: number) => {
    track('offer_sent', { taskId, proposedPrice: price })
  }, [track])

  const trackUpgradeCTAShown = useCallback(() => {
    track('upgrade_cta_shown')
  }, [track])

  const trackUpgradeCTAClicked = useCallback(() => {
    track('upgrade_cta_clicked')
  }, [track])

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    track('search_performed', { query, resultsCount })
  }, [track])

  const trackMapInteraction = useCallback((action: 'zoom' | 'pan' | 'marker_click') => {
    track('map_interaction', { action })
  }, [track])

  return {
    track,
    trackTaskView,
    trackOfferSent,
    trackUpgradeCTAShown,
    trackUpgradeCTAClicked,
    trackSearch,
    trackMapInteraction,
  }
}
