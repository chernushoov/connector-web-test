'use client'

import { useState, useCallback } from 'react'
import { useConnectorStore } from '@/store'

type ActionStatus = 'idle' | 'loading' | 'success' | 'error'

interface ActionState {
  status: ActionStatus
  message: string | null
  error: string | null
}

interface ActionFeedbackOptions {
  successMessage?: string
  errorMessage?: string
  showToast?: boolean
  duration?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

const defaultState: ActionState = {
  status: 'idle',
  message: null,
  error: null,
}

/**
 * Hook for standardized action feedback across the app
 *
 * Usage:
 * const { execute, isLoading, isSuccess, isError, reset } = useActionFeedback()
 *
 * const handleApply = () => execute(
 *   async () => await applyToShift(shiftId),
 *   { successMessage: 'Application sent!', errorMessage: 'Failed to apply' }
 * )
 */
export function useActionFeedback() {
  const [state, setState] = useState<ActionState>(defaultState)
  const { showToast } = useConnectorStore()

  const execute = useCallback(async <T>(
    action: () => Promise<T>,
    options: ActionFeedbackOptions = {}
  ): Promise<T | null> => {
    const {
      successMessage = 'Success!',
      errorMessage = 'Something went wrong',
      showToast: shouldShowToast = true,
      duration = 3000,
      onSuccess,
      onError,
    } = options

    setState({ status: 'loading', message: null, error: null })

    try {
      const result = await action()

      setState({ status: 'success', message: successMessage, error: null })

      if (shouldShowToast) {
        showToast(successMessage, 'success')
      }

      onSuccess?.()

      // Auto-reset after duration
      setTimeout(() => {
        setState(prev => prev.status === 'success' ? defaultState : prev)
      }, duration)

      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : errorMessage

      setState({ status: 'error', message: null, error: errorMsg })

      if (shouldShowToast) {
        showToast(errorMsg, 'error')
      }

      onError?.(error instanceof Error ? error : new Error(errorMsg))

      // Auto-reset after duration
      setTimeout(() => {
        setState(prev => prev.status === 'error' ? defaultState : prev)
      }, duration)

      return null
    }
  }, [showToast])

  const reset = useCallback(() => {
    setState(defaultState)
  }, [])

  return {
    execute,
    reset,
    status: state.status,
    message: state.message,
    error: state.error,
    isIdle: state.status === 'idle',
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  }
}

/**
 * Predefined action messages for common operations
 */
export const ACTION_MESSAGES = {
  // Worker actions
  apply: {
    success: 'Application sent! The employer will be notified.',
    error: 'Failed to send application. Please try again.',
    loading: 'Sending application...',
  },
  cancelApplication: {
    success: 'Application cancelled.',
    error: 'Failed to cancel application.',
    loading: 'Cancelling...',
  },
  startShift: {
    success: 'Shift started! Timer is running.',
    error: 'Failed to start shift.',
    loading: 'Starting shift...',
  },
  endShift: {
    success: 'Shift completed! Great work!',
    error: 'Failed to end shift.',
    loading: 'Ending shift...',
  },
  submitReview: {
    success: 'Thank you for your review!',
    error: 'Failed to submit review.',
    loading: 'Submitting review...',
  },

  // Employer actions
  createShift: {
    success: 'Shift published! Workers can now apply.',
    error: 'Failed to publish shift.',
    loading: 'Publishing shift...',
  },
  updateShift: {
    success: 'Shift updated successfully.',
    error: 'Failed to update shift.',
    loading: 'Updating shift...',
  },
  deleteShift: {
    success: 'Shift deleted.',
    error: 'Failed to delete shift.',
    loading: 'Deleting shift...',
  },
  approveWorker: {
    success: 'Worker approved and notified!',
    error: 'Failed to approve worker.',
    loading: 'Approving...',
  },
  rejectWorker: {
    success: 'Application declined.',
    error: 'Failed to decline application.',
    loading: 'Declining...',
  },

  // Profile actions
  saveProfile: {
    success: 'Profile saved!',
    error: 'Failed to save profile.',
    loading: 'Saving...',
  },
  uploadPhoto: {
    success: 'Photo uploaded!',
    error: 'Failed to upload photo.',
    loading: 'Uploading...',
  },
  uploadDocument: {
    success: 'Document uploaded! Verification pending.',
    error: 'Failed to upload document.',
    loading: 'Uploading document...',
  },

  // Auth actions
  sendCode: {
    success: 'Code sent! Check your phone.',
    error: 'Failed to send code. Please try again.',
    loading: 'Sending code...',
  },
  verifyCode: {
    success: 'Phone verified!',
    error: 'Invalid code. Please try again.',
    loading: 'Verifying...',
  },
  login: {
    success: 'Welcome back!',
    error: 'Login failed. Please try again.',
    loading: 'Logging in...',
  },
  logout: {
    success: 'Logged out successfully.',
    error: 'Failed to log out.',
    loading: 'Logging out...',
  },

  // Payment actions
  subscribe: {
    success: 'Welcome to PRO!',
    error: 'Payment failed. Please try again.',
    loading: 'Processing payment...',
  },
  cancelSubscription: {
    success: 'Subscription cancelled.',
    error: 'Failed to cancel subscription.',
    loading: 'Cancelling subscription...',
  },

  // Generic
  save: {
    success: 'Saved!',
    error: 'Failed to save.',
    loading: 'Saving...',
  },
  delete: {
    success: 'Deleted!',
    error: 'Failed to delete.',
    loading: 'Deleting...',
  },
  copy: {
    success: 'Copied to clipboard!',
    error: 'Failed to copy.',
    loading: 'Copying...',
  },
  share: {
    success: 'Shared successfully!',
    error: 'Failed to share.',
    loading: 'Sharing...',
  },
} as const

export type ActionType = keyof typeof ACTION_MESSAGES

export default useActionFeedback
