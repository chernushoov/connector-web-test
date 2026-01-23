// ============================================
// Content Moderation Hook
// ============================================

import { useState, useCallback } from 'react'

export interface ModerationResult {
  isViolation: boolean
  confidence: number
  reasons: string[]
  action: 'approve' | 'flag' | 'reject'
  details?: {
    hasContactInfo: boolean
    hasProfanity: boolean
    isSpam: boolean
    isSuspiciousRate: boolean
    categories: string[]
  }
}

export interface ModerationState {
  isLoading: boolean
  result: ModerationResult | null
  error: string | null
}

export function useModeration() {
  const [state, setState] = useState<ModerationState>({
    isLoading: false,
    result: null,
    error: null,
  })

  const moderate = useCallback(async (
    content: string,
    type: 'shift' | 'profile' | 'review' | 'message',
    metadata?: {
      title?: string
      rate?: number
      userId?: string
    }
  ): Promise<ModerationResult | null> => {
    setState({ isLoading: true, result: null, error: null })

    try {
      const response = await fetch('/api/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, type, metadata }),
      })

      if (!response.ok) {
        throw new Error('Moderation request failed')
      }

      const result: ModerationResult = await response.json()

      setState({ isLoading: false, result, error: null })
      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState({ isLoading: false, result: null, error: errorMessage })
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ isLoading: false, result: null, error: null })
  }, [])

  return {
    ...state,
    moderate,
    reset,
  }
}

// Helper function to get localized moderation messages
export function getModerationMessage(result: ModerationResult, language: 'ru' | 'en' | 'he' = 'ru'): string {
  const messages = {
    ru: {
      approve: 'Контент одобрен автоматически',
      flag: 'Контент отправлен на проверку модератору',
      reject: 'Контент отклонён автоматически',
      reasons: {
        'Contains contact information': 'Содержит контактную информацию',
        'Contains inappropriate language': 'Содержит ненормативную лексику',
        'Potential spam or scam content': 'Подозрение на спам или мошенничество',
        'Unusually high payment rate': 'Подозрительно высокая оплата',
        'Contains potentially discriminatory content': 'Содержит дискриминационный контент',
      },
    },
    en: {
      approve: 'Content approved automatically',
      flag: 'Content sent for moderator review',
      reject: 'Content rejected automatically',
      reasons: {
        'Contains contact information': 'Contains contact information',
        'Contains inappropriate language': 'Contains inappropriate language',
        'Potential spam or scam content': 'Potential spam or scam content',
        'Unusually high payment rate': 'Unusually high payment rate',
        'Contains potentially discriminatory content': 'Contains potentially discriminatory content',
      },
    },
    he: {
      approve: 'התוכן אושר באופן אוטומטי',
      flag: 'התוכן נשלח לבדיקת המנהל',
      reject: 'התוכן נדחה באופן אוטומטי',
      reasons: {
        'Contains contact information': 'מכיל פרטי יצירת קשר',
        'Contains inappropriate language': 'מכיל שפה לא הולמת',
        'Potential spam or scam content': 'חשד לספאם או הונאה',
        'Unusually high payment rate': 'שכר גבוה באופן חשוד',
        'Contains potentially discriminatory content': 'מכיל תוכן מפלה',
      },
    },
  }

  const t = messages[language]
  const actionMessage = t[result.action]

  if (result.reasons.length === 0) {
    return actionMessage
  }

  const localizedReasons = result.reasons
    .map(reason => (t.reasons as Record<string, string>)[reason] || reason)
    .join(', ')

  return `${actionMessage}: ${localizedReasons}`
}
