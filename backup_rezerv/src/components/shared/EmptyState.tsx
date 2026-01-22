'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUI } from '@/store'
import { t } from '@/i18n/translations'
import { Button } from '@/components/ui/Button'
import {
  SearchX,
  Users,
  FileText,
  Heart,
  Bell,
  MapPin,
  Briefcase,
  AlertCircle
} from 'lucide-react'

type EmptyStateType =
  | 'no-results'
  | 'no-workers'
  | 'no-tasks'
  | 'no-favorites'
  | 'no-notifications'
  | 'no-shifts'
  | 'no-applications'
  | 'error'
  | 'custom'

interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  titleKey?: string
  subtitle?: string
  subtitleKey?: string
  icon?: React.ReactNode
  action?: {
    label: string
    labelKey?: string
    onClick: () => void
  }
  className?: string
}

const icons: Record<EmptyStateType, React.ReactNode> = {
  'no-results': <SearchX className="w-16 h-16" />,
  'no-workers': <Users className="w-16 h-16" />,
  'no-tasks': <FileText className="w-16 h-16" />,
  'no-favorites': <Heart className="w-16 h-16" />,
  'no-notifications': <Bell className="w-16 h-16" />,
  'no-shifts': <Briefcase className="w-16 h-16" />,
  'no-applications': <Users className="w-16 h-16" />,
  'error': <AlertCircle className="w-16 h-16" />,
  'custom': <MapPin className="w-16 h-16" />,
}

const translationKeys: Record<EmptyStateType, { title: string; subtitle: string }> = {
  'no-results': { title: 'empty.no.results', subtitle: 'empty.no.results.subtitle' },
  'no-workers': { title: 'empty.no.workers', subtitle: 'empty.no.workers.subtitle' },
  'no-tasks': { title: 'empty.no.tasks', subtitle: 'empty.no.tasks.subtitle' },
  'no-favorites': { title: 'empty.no.favorites', subtitle: 'empty.no.favorites.subtitle' },
  'no-notifications': { title: 'empty.no.results', subtitle: 'empty.no.results.subtitle' },
  'no-shifts': { title: 'empty.no.tasks', subtitle: 'empty.no.tasks.subtitle' },
  'no-applications': { title: 'empty.no.results', subtitle: 'empty.no.results.subtitle' },
  'error': { title: 'error.generic', subtitle: 'common.retry' },
  'custom': { title: 'empty.no.results', subtitle: 'empty.no.results.subtitle' },
}

export function EmptyState({
  type = 'no-results',
  title,
  titleKey,
  subtitle,
  subtitleKey,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const { language, isRTL } = useUI()

  const displayTitle = title || titleKey
    ? (titleKey ? t(titleKey as any, language) : title)
    : t(translationKeys[type].title as any, language)

  const displaySubtitle = subtitle || subtitleKey
    ? (subtitleKey ? t(subtitleKey as any, language) : subtitle)
    : t(translationKeys[type].subtitle as any, language)

  const displayIcon = icon || icons[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center',
        'py-12 px-6 text-center',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="text-neutral-300 mb-4"
      >
        {displayIcon}
      </motion.div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-neutral-700 mb-2">
        {displayTitle}
      </h3>

      {/* Subtitle */}
      <p className="text-sm text-neutral-500 max-w-[280px] mb-6">
        {displaySubtitle}
      </p>

      {/* Action button */}
      {action && (
        <Button
          variant="primary"
          size="md"
          onClick={action.onClick}
        >
          {action.labelKey ? t(action.labelKey as any, language) : action.label}
        </Button>
      )}
    </motion.div>
  )
}

export default EmptyState
