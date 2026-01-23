'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
  Loader2,
} from 'lucide-react'
import type { ModerationResult } from '@/hooks/useModeration'

interface ModerationBadgeProps {
  result: ModerationResult | null
  isLoading?: boolean
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  language?: 'ru' | 'en' | 'he'
}

export function ModerationBadge({
  result,
  isLoading = false,
  size = 'md',
  showDetails = false,
  language = 'ru',
}: ModerationBadgeProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-neutral-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">
          {language === 'ru' ? 'Проверка...' : language === 'he' ? 'בודק...' : 'Checking...'}
        </span>
      </div>
    )
  }

  if (!result) {
    return null
  }

  const t = {
    ru: {
      approved: 'Одобрено',
      flagged: 'На проверке',
      rejected: 'Отклонено',
      confidence: 'Уверенность',
      reasons: 'Причины',
    },
    en: {
      approved: 'Approved',
      flagged: 'Flagged',
      rejected: 'Rejected',
      confidence: 'Confidence',
      reasons: 'Reasons',
    },
    he: {
      approved: 'מאושר',
      flagged: 'סומן לבדיקה',
      rejected: 'נדחה',
      confidence: 'ביטחון',
      reasons: 'סיבות',
    },
  }[language]

  const config = {
    approve: {
      icon: CheckCircle,
      label: t.approved,
      bgColor: 'bg-success/10',
      textColor: 'text-success',
      borderColor: 'border-success/20',
    },
    flag: {
      icon: AlertTriangle,
      label: t.flagged,
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      borderColor: 'border-warning/20',
    },
    reject: {
      icon: XCircle,
      label: t.rejected,
      bgColor: 'bg-danger/10',
      textColor: 'text-danger',
      borderColor: 'border-danger/20',
    },
  }[result.action]

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }[size]

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size]

  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-2"
    >
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses}`}
      >
        <Icon className={iconSize} />
        <span className="font-medium">{config.label}</span>
        <span className="opacity-60">({result.confidence}%)</span>
      </div>

      {showDetails && result.reasons.length > 0 && (
        <div className="text-sm text-neutral-600 space-y-1">
          <p className="font-medium">{t.reasons}:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {result.reasons.map((reason, index) => (
              <li key={index} className="text-neutral-500">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}
