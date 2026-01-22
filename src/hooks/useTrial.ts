'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { useConnectorStore, useSubscription } from '@/store'

const TRIAL_DURATION_DAYS = 3
const TRIAL_CHECK_INTERVAL = 60000 // Check every minute

export function useTrial() {
  const subscription = useSubscription()
  const {
    startTrial,
    checkTrialStatus,
    subscribe,
    openTrialEndModal,
    closeTrialEndModal,
    openPricingModal,
    closePricingModal,
    getTrialDaysRemaining,
    getTrialHoursRemaining,
    updateTrialStats,
  } = useConnectorStore()

  // Check trial status periodically
  useEffect(() => {
    if (subscription.trialStatus === 'active' || subscription.trialStatus === 'ending_soon') {
      checkTrialStatus()
      const interval = setInterval(checkTrialStatus, TRIAL_CHECK_INTERVAL)
      return () => clearInterval(interval)
    }
  }, [subscription.trialStatus, checkTrialStatus])

  // Computed values
  const daysRemaining = useMemo(() => {
    if (!subscription.trialEndsAt) return TRIAL_DURATION_DAYS
    const remaining = new Date(subscription.trialEndsAt).getTime() - Date.now()
    return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24)))
  }, [subscription.trialEndsAt])

  const hoursRemaining = useMemo(() => {
    if (!subscription.trialEndsAt) return TRIAL_DURATION_DAYS * 24
    const remaining = new Date(subscription.trialEndsAt).getTime() - Date.now()
    return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60)))
  }, [subscription.trialEndsAt])

  const isTrialActive = subscription.trialStatus === 'active' || subscription.trialStatus === 'ending_soon'
  const isTrialEnding = subscription.trialStatus === 'ending_soon'
  const isTrialEnded = subscription.trialStatus === 'ended'
  const isSubscribed = subscription.subscriptionState === 'subscribed'
  const isFreeUser = subscription.subscriptionState === 'free_limited'
  const isPro = subscription.currentPlan === 'pro' || subscription.currentPlan === 'business'

  // Format time remaining for display
  const timeRemainingText = useMemo(() => {
    if (hoursRemaining <= 0) return 'Ended'
    if (hoursRemaining < 24) return `${hoursRemaining}h left`
    return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`
  }, [daysRemaining, hoursRemaining])

  // Get badge color based on status
  const badgeColor = useMemo(() => {
    if (isSubscribed) return 'gold'
    if (isTrialEnding) return 'red'
    if (isTrialActive) return 'blue'
    return 'gray'
  }, [isSubscribed, isTrialEnding, isTrialActive])

  // Get badge text
  const badgeText = useMemo(() => {
    if (isSubscribed) return 'PRO'
    if (isTrialActive) return `Trial: ${timeRemainingText}`
    if (isTrialEnded) return 'Trial ended'
    return 'Free'
  }, [isSubscribed, isTrialActive, isTrialEnded, timeRemainingText])

  // Start trial for new users
  const initializeTrial = useCallback(() => {
    if (subscription.trialStatus === 'not_started') {
      startTrial()
    }
  }, [subscription.trialStatus, startTrial])

  // Check if feature is available based on subscription
  const canUseFeature = useCallback((feature: 'unlimited_applications' | 'priority_search' | 'analytics' | 'team_management') => {
    if (isSubscribed || isTrialActive) return true

    // Free tier limitations
    const freeFeatures = {
      unlimited_applications: false,
      priority_search: false,
      analytics: false,
      team_management: false,
    }

    return freeFeatures[feature]
  }, [isSubscribed, isTrialActive])

  // Get remaining applications for free users
  const remainingApplications = useMemo(() => {
    if (isSubscribed || isTrialActive) return Infinity
    return 2 // Free users get 2 applications per day
  }, [isSubscribed, isTrialActive])

  return {
    // State
    subscription,
    trialStats: subscription.trialStats,

    // Computed
    daysRemaining,
    hoursRemaining,
    timeRemainingText,
    badgeColor,
    badgeText,
    remainingApplications,

    // Booleans
    isTrialActive,
    isTrialEnding,
    isTrialEnded,
    isSubscribed,
    isFreeUser,
    isPro,

    // Actions
    startTrial,
    initializeTrial,
    subscribe,
    checkTrialStatus,
    updateTrialStats,
    canUseFeature,

    // Modals
    showTrialEndModal: subscription.showTrialEndModal,
    showPricingModal: subscription.showPricingModal,
    openTrialEndModal,
    closeTrialEndModal,
    openPricingModal,
    closePricingModal,
  }
}

export default useTrial
