'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Button } from '@/components/ui/Button'
import { AlertCircle, WifiOff, MapPinOff, ShieldOff, RefreshCw } from 'lucide-react'

type ErrorType = 'generic' | 'network' | 'location' | 'permission' | 'not-found' | 'custom'

interface ErrorStateProps {
  type?: ErrorType
  title?: string
  titleKey?: string
  message?: string
  messageKey?: string
  icon?: React.ReactNode
  onRetry?: () => void
  retryLabel?: string
  retryLabelKey?: string
  fullScreen?: boolean
  className?: string
}

const icons: Record<ErrorType, React.ReactNode> = {
  generic: <AlertCircle className="w-16 h-16" />,
  network: <WifiOff className="w-16 h-16" />,
  location: <MapPinOff className="w-16 h-16" />,
  permission: <ShieldOff className="w-16 h-16" />,
  'not-found': <AlertCircle className="w-16 h-16" />,
  custom: <AlertCircle className="w-16 h-16" />,
}

const translationKeys: Record<ErrorType, { title: string; message: string }> = {
  generic: { title: 'error.generic', message: 'error.generic' },
  network: { title: 'error.network', message: 'error.network' },
  location: { title: 'error.location', message: 'error.location' },
  permission: { title: 'error.permission', message: 'error.permission' },
  'not-found': { title: 'error.generic', message: 'error.generic' },
  custom: { title: 'error.generic', message: 'error.generic' },
}

export function ErrorState({
  type = 'generic',
  title,
  titleKey,
  message,
  messageKey,
  icon,
  onRetry,
  retryLabel,
  retryLabelKey,
  fullScreen = false,
  className,
}: ErrorStateProps) {
  const { language, isRTL } = useUI()

  const displayTitle = title || titleKey
    ? (titleKey ? t(titleKey as any, language) : title)
    : t(translationKeys[type].title as any, language)

  const displayMessage = message || messageKey
    ? (messageKey ? t(messageKey as any, language) : message)
    : t(translationKeys[type].message as any, language)

  const displayRetryLabel = retryLabel || retryLabelKey
    ? (retryLabelKey ? t(retryLabelKey as any, language) : retryLabel)
    : t('common.retry', language)

  const displayIcon = icon || icons[type]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center',
        'py-12 px-6 text-center',
        fullScreen && 'fixed inset-0 bg-white z-50',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="text-danger/70 mb-4"
      >
        {displayIcon}
      </motion.div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-neutral-800 mb-2">
        {displayTitle}
      </h3>

      {/* Message */}
      <p className="text-sm text-neutral-500 max-w-[280px] mb-6">
        {displayMessage}
      </p>

      {/* Retry button */}
      {onRetry && (
        <Button
          variant="primary"
          size="md"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          {displayRetryLabel}
        </Button>
      )}
    </motion.div>
  )
}

export default ErrorState
